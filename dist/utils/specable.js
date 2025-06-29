"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitterSpecable = exports.Specable = void 0;
exports.hiddenProperty = hiddenProperty;
exports.getterProperty = getterProperty;
const stream_1 = require("stream");
// makes it hidden from debug
const serializableFieldsSymbol = Symbol('serializableFields');
function hiddenProperty(target, propertyKey) {
    if (!target.constructor[serializableFieldsSymbol])
        target.constructor[serializableFieldsSymbol] = [];
    target.constructor[serializableFieldsSymbol].push({ propertyKey, show: false });
}
;
// for getters
function getterProperty(target, propertyKey) {
    if (!target.constructor[serializableFieldsSymbol])
        target.constructor[serializableFieldsSymbol] = [];
    const fieldName = propertyKey;
    target.constructor[serializableFieldsSymbol].push({ propertyKey, show: true, fieldName });
}
;
function autoSpec() {
    const serializedData = {};
    const decoratedFields = this.constructor[serializableFieldsSymbol] || [];
    const allFields = Object.keys(this);
    // Handle decorated fields first
    for (const field of decoratedFields) {
        if (!field.show)
            continue;
        const fieldName = field.fieldName || field.propertyKey;
        const value = this[field.propertyKey];
        if (value !== undefined)
            serializedData[fieldName] = value;
    }
    // Handle non-decorated fields
    for (const field of allFields) {
        if (field === 'constructor')
            continue;
        if (!decoratedFields.some((decorated) => decorated.propertyKey === field)) {
            const value = this[field];
            if (typeof value !== 'function' && value !== undefined)
                serializedData[field] = value;
        }
    }
    return serializedData;
}
class Specable {
    [Symbol.for('nodejs.util.inspect.custom')]() { return autoSpec.bind(this)(); }
}
exports.Specable = Specable;
class EventEmitterSpecable extends stream_1.EventEmitter {
    [Symbol.for('nodejs.util.inspect.custom')]() { return autoSpec.bind(this)(); }
}
exports.EventEmitterSpecable = EventEmitterSpecable;
//# sourceMappingURL=specable.js.map