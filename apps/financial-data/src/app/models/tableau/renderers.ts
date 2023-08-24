import { Tag } from "@models/financial/tag.model";

export function renderTags(tags: Tag[]): string {

    return (tags || [])
    .map(
        (tag: Tag) => {
            let display = tag.type

            if (tag?.value)
                display += `:${tag.value}`

            return display
        }
    )
    .join(", ")
}