'use client'

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useEffect } from 'react';
import { HocuspocusProvider } from "@hocuspocus/provider";
import { BoxOnChange, BoxIdCallback, Scene } from "~/components/scene";
import * as Y from "yjs";
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { NextPage } from 'next';
import { state, Action, ActionType } from "~/store";
import { choose, lerp, uniform } from '~/lib';
import { useSnapshot } from 'valtio';

type Mutate = (mutation: Action) => void

function useRemote(url: string, name: string, document: Y.Doc) {
    useEffect(() => {
        const provider = new HocuspocusProvider({
            url,
            name,
            document,
        });

        provider.on("status", ({ status }) => {
            console.log("provider status is", status);
        })

        return () => {
            provider.destroy()
        }
    }, [url, name, document]);
}

function useDoc(name: string): [Y.Doc, Mutate] {
    const ref = useRef(new Y.Doc())
    useRemote("ws://127.0.0.1:1234", name, ref.current);
    const mutate = useMemo<Mutate>(() => {
        const doc = ref.current;
        const yboxes = doc.getMap<any>("boxes");
        return mutation => {
            switch (mutation.type) {
                case ActionType.ADD: {
                    const size = yboxes.size;
                    let fraction = 0.5;
                    if (size > 0) {
                        let max = 0
                        for (const b of yboxes.values()) {
                            const f = b.get("fraction") as number;
                            if (f > max) {
                                max = f;
                            }
                        }
                        fraction = lerp(0.5, max, 1);
                    }
                    const id = uuidv4();
                    const ybox = new Y.Map<string | number>();
                    ybox.set("id", id);
                    ybox.set("name", `Box ${Date.now()}`);
                    ybox.set("fraction", fraction);
                    ybox.set("x", uniform(0, 300));
                    ybox.set("y", uniform(0, 300));
                    ybox.set("width", 100);
                    ybox.set("height", 100);
                    ybox.set("color", "#ff00ff");
                    yboxes.set(id, ybox);
                    break;
                }
                case ActionType.CHANGE: {
                    doc.transact(() => {
                        for (const { id, key, value } of mutation.changes) {
                            const ybox = yboxes.get(id)!
                            ybox.set(key, value);
                        }
                    })
                    break;
                }
                case ActionType.DELETE: {
                    yboxes.delete(mutation.id);
                    break;
                }
                case ActionType.MOVE_TOP: {
                    const [maxId, maxFraction] = getMaxFraction(yboxes);
                    if (maxId === mutation.id) {
                        break;
                    }
                    const ybox = yboxes.get(mutation.id)!;
                    const fraction = lerp(0.01, maxFraction, 1);
                    ybox.set("fraction", fraction);
                    break;
                }
                default: {
                    throw new Error("UB")
                }
            }
        }
    }, [ref.current]);
    return [ref.current, mutate]
}

function useSync(doc: Y.Doc) {
    useEffect(() => {
        const yboxes = doc.getMap("boxes");
        const observe = (event: any) => {
            console.log("observe", event[0].target)
            const doc = event[0].target.doc;
            const data = doc.toJSON();
            state.boxesOrder = Object
                .keys(data.boxes)
                .sort((i, j) => {
                    const a = data.boxes[i].fraction;
                    const b = data.boxes[j].fraction;
                    return a - b
                })
                .map(key => key)
            state.boxes = data.boxes;
        };
        yboxes.observeDeep(observe);
        return () => {
            yboxes.unobserveDeep(observe);
        }
    }, [doc]);
}

function getMaxFraction(yboxes: Y.Map<any>): [string, number] {
    let max = ["", 0] as [string, number]
    for (const [key, value] of yboxes.entries()) {
        const f = value.get("fraction") as number;
        if (f >= max[1]) {
            max = [key, f];
        }
    }
    return max
}

function useMonkey(mutate: Mutate, ms: number, actions?: string[]) {
    const { boxesOrder } = useSnapshot(state)

    useEffect(() => {
        if (!actions) {
            return
        }

        const interval = setInterval(() => {
            const id = choose(boxesOrder)
            if (!id) {
                return;
            }

            const action = choose(actions)
            switch (action) {
                case "color": {
                    const r = Math.floor(uniform(0, 256))
                    const g = Math.floor(uniform(0, 256))
                    const b = Math.floor(uniform(0, 200))
                    const color = `rgb(${r}, ${g}, ${b})`
                    mutate({
                        type: ActionType.CHANGE,
                        changes: [
                            { id, key: "color", value: color },
                        ],
                    });
                    break;
                }
                case "size": {
                    mutate({
                        type: ActionType.CHANGE,
                        changes: [
                            { id, key: "width", value: uniform(10, 20) },
                            { id, key: "height", value: uniform(10, 20) },
                        ],
                    });
                    break;
                }
                case "xy": {
                    mutate({
                        type: ActionType.CHANGE,
                        changes: [
                            { id, key: "x", value: uniform(0, 600) },
                            { id, key: "y", value: uniform(0, 700) },
                        ],
                    });
                    break;
                }
            }
        }, ms)
        return () => {
            clearInterval(interval)
        }
    }, [boxesOrder, actions])
}

const Page: NextPage = () => {
    const params = useParams();
    const docId = `doc:${params.docId}`;
    const [doc, mutate] = useDoc(docId);
    useSync(doc);

    const searchParams = useSearchParams();
    const monkey = searchParams.get("monkey");
    useMonkey(mutate, uniform(1000, 2000), monkey ? [monkey] : undefined)

    const onClick = useCallback<BoxIdCallback>(id => {
        mutate({
            type: ActionType.MOVE_TOP,
            id,
        });
    }, [mutate])

    const onChange = useCallback<BoxOnChange>(changes => {
        mutate({
            type: ActionType.CHANGE,
            changes,
        })
    }, [mutate]);

    const onDelete = useCallback<BoxIdCallback>(id => {
        mutate({
            type: ActionType.DELETE,
            id,
        })
    }, [mutate]);

    const onAdd = useCallback(() => {
        mutate({
            type: ActionType.ADD,
        })
    }, [mutate]);

    return (
        <div>
            <h1>{docId}</h1>

            <Scene
                onChange={onChange}
                onClick={onClick}
                onDelete={onDelete}
            />

            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                display: "flex",
                gap: 10,
                justifyContent: "center",
                margin: 10,
            }}>
                <button
                    onClick={onAdd}
                >
                    add
                </button>
                {!monkey ? null : (
                    <span>
                        monkey: {monkey}
                    </span>
                )}
            </div>
        </div>
    )
}

export default Page
