"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const image_1 = require("./image");
class ObjectPatcher {
    static patch(client, instance, object) {
        const avatarFileName = object["avatar_file_name"] || object["character_avatar_uri"];
        if (avatarFileName) {
            const avatar = new image_1.CAIImage(client, false);
            avatar.changeToEndpointUrlSync(avatarFileName);
            instance.avatar = avatar;
        }
        for (const [key, value] of Object.entries(object)) {
            if (key == "avatar_file_name" || key == "character_avatar_uri")
                continue;
            instance[key] = value;
        }
    }
    static clean(object) {
        for (const [key, value] of Object.entries(object)) {
            if (value != undefined)
                continue;
            delete object[key];
        }
        return object;
    }
}
exports.default = ObjectPatcher;
//# sourceMappingURL=patcher.js.map