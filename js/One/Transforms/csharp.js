class CsArray {
    get Count() { return this._one.length; }
    Add(item) {
        this._one.add(item);
    }
    get(index) {
        return this._one.get(index);
    }
    set(index, value) {
        return this._one.set(index, value);
    }
}
class CsMap {
    get(key) {
        this._one.get(key);
    }
    set(key, value) {
        this._one.set(key, value);
    }
    get Keys() {
        return this._one.keys();
    }
    get Values() {
        return this._one.values();
    }
    Remove(key) {
        this._one.remove(key);
    }
}
class CsString {
    get Length() {
        return this._one.length;
    }
    get(idx) {
        return this._one.get(idx);
    }
    Substring(start, length) {
        return this._one.substring(start, start + length);
    }
    Split(separator) {
        return this._one.split(separator);
    }
}
class CsNumber {
}
class Console {
    static WriteLine(data) {
        OneConsole.print(data);
    }
}
//# sourceMappingURL=csharp.js.map