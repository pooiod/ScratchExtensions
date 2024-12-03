function extractAutoCompleteMap(Scratch) {
    function getAllKeys(obj, path = "", seen = new WeakSet()) {
        if (obj !== Object(obj) || seen.has(obj)) return [];
        seen.add(obj);

        let keys = [];
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const currentPath = path ? `${path}.${key}` : key;
                keys.push(currentPath);
                keys = keys.concat(getAllKeys(obj[key], currentPath, seen));
            }
        }
        return keys;
    }

    function getFunctionSignature(fn) {
        try {
            const args = fn.toString().match(/\(([^)]*)\)/);
            return args ? args[1].replace(/\s+/g, "").split(",") : [];
        } catch {
            return [];
        }
    }

    const keys = getAllKeys(Scratch);
    const functions = [];
    const variables = [];

    keys.forEach((key, index) => {
        try {
            const value = eval(key);
            if (typeof value === "function") {
                const params = getFunctionSignature(value);
                functions.push(`${key}(${params.join(",")})`);
            } else {
                variables.push(key);
            }
        } catch (err) {
            // console.warn("Skipped key", err);
        }
        console.log(`Generating function map: ${Math.round((index + 1)/keys.length*100)}%`);
    });

    return JSON.stringify({ functions, variables }, null, 2);
}

console.log(extractAutoCompleteMap(Scratch));
