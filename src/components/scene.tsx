'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import { button, folder, useControls } from "leva";
import { state } from '../store';
import { useDrag } from '~/hooks/useDrag';
import { clamp } from '~/lib';

export type BoxChange = {
    id: string,
    key: string,
    value: string | number
}

export type BoxOnChange = (changes: BoxChange[]) => void
export type BoxIdCallback = (id: string) => void
export type BoxOnDown = (id: string) => void

export type BoxProps = {
    id: string
    name: string
    x: number
    y: number
    width: number
    height: number
    color: string
    onChange: BoxOnChange
    onClick?: BoxIdCallback
    onDown?: BoxIdCallback
    style?: React.CSSProperties
}

export const Box: React.FC<BoxProps> = ({ id, x, y, width, height, color, onChange, onClick, onDown, style }) => {
    const ref = useRef();
    const [translate, setTranslate] = useState({ x, y });

    useEffect(() => {
        setTranslate({ x, y })
    }, [x, y]);

    useDrag(ref, {
        onDrag: (e, coord) => {
            setTranslate(coord);
            onChange([
                { id, key: "x", value: coord.x },
                { id, key: "y", value: coord.y },
            ]);
        },
    });

    const click = useCallback(() => {
        if (typeof onClick === "function") {
            onClick(id);
        }
    }, [id, onClick])

    const down = useCallback(() => {
        if (typeof onDown === "function") {
            onDown(id);
        }
    }, [id, onDown])

    return (
        <div
            ref={ref}
            style={{
                ...style,
                position: "absolute",
                top: translate.y,
                left: translate.x,
                width: width,
                height: height,
                backgroundColor: color,
                border: "2px solid black",
            }}
            onClick={click}
            onMouseDown={down}
        />
    )
}

export type SceneProps = {
    onChange: BoxOnChange
    onClick: BoxIdCallback
    onDelete: BoxIdCallback
}

export const Scene: React.FC<SceneProps> = ({ onChange, onClick, onDelete }) => {
    const { boxesOrder, boxes } = useSnapshot(state);
    const [currentId, setCurrentId] = useState<string | null>(null)
    const [, set, get] = useControls(() => ({
        showBox: {
            value: false,
            render: () => false,
        },
        Box: folder({
            id: {
                value: "",
                editable: false,
            },
            name: {
                value: "",
                onChange: (value) => {
                    const id = get("id")
                    if (!id) {
                        return
                    }
                    onChange([
                        { id, key: "name", value: value },
                    ]);
                },
            },
            position: {
                value: { x: 0, y: 0 },
                joystick: false,
                step: 1,
                onChange: ({ x, y }) => {
                    const id = get("id")
                    if (!id) {
                        return
                    }
                    onChange([
                        { id, key: "x", value: x },
                        { id, key: "y", value: y },
                    ]);
                },
            },
            size: {
                value: [0, 0],
                joystick: true,
                step: 5,
                onChange: ([width, height]) => {
                    const id = get("id")
                    if (!id) {
                        return
                    }
                    onChange([
                        { id, key: "width", value: clamp(width, 10, 300) },
                        { id, key: "height", value: clamp(height, 10, 300) },
                    ]);
                },
            },
            color: {
                value: "#fff",
                onChange: (value) => {
                    const id = get("id")
                    if (!id) {
                        return
                    }
                    onChange([
                        { id, key: "color", value: value },
                    ]);
                },
            },
            delete: button(() => {
                const id = get("id")
                if (!id) {
                    return
                }
                onDelete(id)
            }),
        }, {
            render: get => get("showBox"),
        }),
    }))

    useEffect(() => {
        if (currentId) {
            set({
                showBox: true,
            })
        } else {
            set({
                showBox: false,
            })
        }
    }, [currentId, set])

    useEffect(() => {
        if (!currentId) {
            return
        }
        if (!boxesOrder.includes(currentId)) {
            setCurrentId(null)
        }
    }, [currentId, boxesOrder])

    useEffect(() => {
        if (!currentId) {
            return
        }

        const box = boxes[currentId]
        if (!box) {
            return
        }

        set({
            id: currentId,
            name: box.name,
            color: box.color,
            position: { x: box.x, y: box.y },
            size: [box.width, box.height],
        })
    }, [currentId, boxes, set])

    const down = useCallback<BoxIdCallback>(id => {
        setCurrentId(id)
        onClick(id)
    }, [onClick])

    return (
        <div style={{ position: "relative" }}>
            {boxesOrder.map((id, index) => {
                const box = boxes[id]
                return (
                    <Box
                        key={box.id}
                        id={box.id}
                        name={box.name ?? `Box ${index}`}
                        x={box.x}
                        y={box.y}
                        width={box.width}
                        height={box.height}
                        color={box.color}
                        onChange={onChange}
                        onDown={down}
                        style={{
                            zIndex: index + 1,
                        }}
                    />
                )
            })}
        </div>
    )
}
