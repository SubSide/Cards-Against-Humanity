import { TagType } from "../../common/models/Tag";
let tagTypes = new Map<number, string>();
tagTypes.set(TagType.Primary, "primary");
tagTypes.set(TagType.Secondary, "secondary");
tagTypes.set(TagType.Success, "success");
tagTypes.set(TagType.Danger, "danger");
tagTypes.set(TagType.Warning, "warning");
tagTypes.set(TagType.Info, "info");
tagTypes.set(TagType.Dark, "dark");

export const TagTypes = tagTypes;