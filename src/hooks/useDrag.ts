import { useState, useEffect, useRef } from 'react';

export type DragOptions = {
    onPointerDown?: (event: MouseEvent) => void,
    onPointerUp?: (event: MouseEvent) => void,
    onPointerMove?: (event: MouseEvent) => void,
    onDrag?: (event: MouseEvent, coord: { x: number, y: number }) => void,
}

export function useDrag(ref, options: DragOptions) {
    const {
        onPointerDown = () => { },
        onPointerUp = () => { },
        onPointerMove = () => { },
        onDrag = () => { },
    } = options;

    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: MouseEvent) => {
        setIsDragging(true);
        offset.current = {
            x: ref.current.offsetLeft - e.clientX,
            y: ref.current.offsetTop - e.clientY,
        }
        onPointerDown(e);
    };

    const handlePointerUp = (e: MouseEvent) => {
        setIsDragging(false);
        onPointerUp(e);
    };

    const handlePointerMove = (e: MouseEvent) => {
        onPointerMove(e);
        if (isDragging) {
            onDrag(e, {
                x: e.clientX + offset.current.x,
                y: e.clientY + offset.current.y,
            });
        }
    };

    useEffect(() => {
        const element: HTMLDivElement = ref.current;
        if (!element) {
            return () => { };
        }

        element.addEventListener('mousedown', event => { });
        element.addEventListener('mousedown', handlePointerDown);
        element.addEventListener('mouseup', handlePointerUp);
        document.addEventListener('mouseup', handlePointerUp);
        element.addEventListener('mousemove', handlePointerMove);

        return () => {
            element.removeEventListener('mousedown', handlePointerDown);
            element.removeEventListener('mouseup', handlePointerUp);
            document.removeEventListener('mouseup', handlePointerUp);
            element.removeEventListener('mousemove', handlePointerMove);
        };
    }, [isDragging]);

    return { isDragging };
};
