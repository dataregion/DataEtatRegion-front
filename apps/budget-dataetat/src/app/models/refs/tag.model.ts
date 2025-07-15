import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';

export interface Tag {
  type: string;
  value: Optional<string>;
  description: Optional<string>;
  display_name: string;
}

/** Nom complet du tag sous format type:value */
export function tag_fullname(tag: Tag) {
  let display = tag.type;

  if (tag?.value) display += `:${tag.value}`;

  return display;
}

export function tag_displayname(tag: Tag) {
  return tag.display_name;
}
