export class MapWithDefault<Key, Value> extends Map<Key, Value> {
    constructor(private factory: (key: Key) => Value) {
        super();
    }

    get(key: Key): Value {
        if (this.has(key)) {
            return super.get(key) as Value;
        } else {
            const value = this.factory(key);
            this.set(key, value);
            return value;
        }
    }
}
