export interface Tag {
    type: string
    value: string
}

export function tag_str(tag: Tag) {
    let display = tag.type

    if (tag?.value)
        display += `:${tag.value}`

    return display
}