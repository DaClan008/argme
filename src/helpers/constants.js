export const states= Object.freeze({
        Faulted: -1,
        NotStarted: 0,
        Started: 1,
        Finalized: 2
    });
export const propertyType = Object.freeze({
    None: 0,
    ShortProperty: 1,
    FullProperty: 2,
    JsonObject: 3,
    Array: 4,
    Undefined: 5
})