import { proxy } from 'valtio';

export type BoxItem = {
    id: string
    name: string
    fraction: number
    x: number
    y: number
    width: number
    height: number
    color: string
}

export type State = {
    boxesOrder: string[],
    boxes: Record<string, BoxItem>,
}

export const state = proxy<State>({
    boxesOrder: [],
    boxes: {},
})

export enum ActionType {
    ADD,
    DELETE,
    CHANGE,
    MOVE_TOP,
}

export type ActionAdd = {
    type: ActionType.ADD
}

export type ActionDelete = {
    type: ActionType.DELETE
    id: string
}

export type ActionMoveTop = {
    type: ActionType.MOVE_TOP
    id: string
}

export type ActionChange = {
    type: ActionType.CHANGE
    changes: {
        id: string
        key: string
        value: string | number
    }[]
}

export type Action =
    | ActionAdd
    | ActionDelete
    | ActionChange
    | ActionMoveTop
