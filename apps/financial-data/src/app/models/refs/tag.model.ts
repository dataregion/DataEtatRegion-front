export interface Tag {
    type: string
    value?: string
    description?: string
    display_name: string
}

/** Nom complet du tag sous format type:value */
export function tag_fullname(tag: Tag) {
    let display = tag.type

    if (tag?.value)
        display += `:${tag.value}`

    return display
}

export function tag_displayname(tag: Tag) {
    return tag.display_name;
}
