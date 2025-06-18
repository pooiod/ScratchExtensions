(function(Scratch) {
    class Hitboxes {
        constructor(runtime) {
            this.runtime = runtime;
            this.hitboxes = {};
            this.debugVisible = false;
            this.canvas = document.createElement('canvas');
            this.canvas.width = 400;
            this.canvas.height = 400;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '50%';
            this.canvas.style.transform = 'translateX(-50%)';
            this.canvas.style.zIndex = '99999';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.border = '2px solid red';
            this.canvas.style.display = 'none';
            document.body.appendChild(this.canvas);
            this.context = this.canvas.getContext('2d');
            requestAnimationFrame(this.update.bind(this));
        }
        getInfo() {
            return {
                id: 'hitboxes',
                name: 'hitboxes',
                blocks: [
                    {
                        func: 'toggleDebug',
                        blockType: Scratch.BlockType.BUTTON,
                        text: 'Toggle debug view'
                    },
                    {
                        opcode: 'create',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create hitbox [TYPE] with id [ID]',
                        arguments: {
                            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'types' },
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'hitbox1' }
                        }
                    },
                    {
                        opcode: 'move',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Move hitbox [ID] to x: [X] y: [Y]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'hitbox1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'rotate',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Rotate hitbox [ID] to [DIR]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'hitbox1' },
                            DIR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 }
                        }
                    },
                    {
                        opcode: 'setSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set size of hitbox [ID] to width: [W] height: [H]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'hitbox1' },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                        }
                    },
                    {
                        opcode: 'deleteHitbox',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Delete hitbox [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'hitbox1' }
                        }
                    },
                    {
                        opcode: 'deleteAllHitboxes',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Delete all hitboxes'
                    },
                    {
                        opcode: 'getTouching',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get hitboxes touching [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'hitbox1' }
                        }
                    },
                    {
                        opcode: 'getAt',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get hitboxes at x: [X] y: [Y]',
                        arguments: {
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'getBBTouching',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get bounding boxes touching [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'hitbox1' }
                        }
                    },
                    {
                        opcode: 'getBBAt',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get bounding boxes at x: [X] y: [Y]',
                        arguments: {
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    }
                ],
                menus: {
                    types: ['box', 'circle', 'sprite']
                }
            };
        }
        toggleDebug() {
            this.debugVisible = !this.debugVisible;
            this.canvas.style.display = this.debugVisible ? 'block' : 'none';
        }
        create({ TYPE, ID }, util) {
            if (!ID) return;
            let newHitbox = {
                type: TYPE,
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                radius: 25,
                direction: 0,
                hull: []
            };
            if (TYPE === 'sprite') {
                const target = util.target;
                if (!target || target.isStage) return;
                const renderer = this.runtime.renderer;
                const drawable = renderer._allDrawables[target.drawableID];
                if (drawable.needsConvexHullPoints()) {
                    const points = renderer._getConvexHullPointsForDrawable(target.drawableID);
                    drawable.setConvexHullPoints(points);
                }
                const hullPoints = drawable._convexHullPoints;
                const scaleX = drawable.scale[0] / 100;
                const scaleY = drawable.scale[1] / -100;
                const offset = drawable.skin.rotationCenter;
                for (let i = 0; i < hullPoints.length; i++) {
                    newHitbox.hull.push({ x: (hullPoints[i][0] - offset[0]) * scaleX, y: (hullPoints[i][1] - offset[1]) * scaleY });
                }
            }
            this.hitboxes[ID] = newHitbox;
        }
        deleteHitbox({ ID }) {
            delete this.hitboxes[ID];
        }
        deleteAllHitboxes() {
            this.hitboxes = {};
        }
        move({ ID, X, Y }) {
            let hitbox = this.hitboxes[ID];
            if (hitbox) {
                hitbox.x = X;
                hitbox.y = Y;
            }
        }
        rotate({ ID, DIR }) {
            let hitbox = this.hitboxes[ID];
            if (hitbox) {
                let radians = DIR * Math.PI / 180;
                for (let point of hitbox.hull) {
                    let nx = point.x * Math.cos(radians) - point.y * Math.sin(radians);
                    let ny = point.x * Math.sin(radians) + point.y * Math.cos(radians);
                    point.x = nx;
                    point.y = ny;
                }
                hitbox.direction = DIR;
            }
        }
        setSize({ ID, W, H }) {
            let hitbox = this.hitboxes[ID];
            if (!hitbox) return;
            if (hitbox.type === 'circle') hitbox.radius = W / 2;
            else if (hitbox.type === 'sprite') {
                let bounds = this._getHullBounds(hitbox.hull);
                let scaleX = W / (bounds.maxX - bounds.minX);
                let scaleY = H / (bounds.maxY - bounds.minY);
                for (let point of hitbox.hull) {
                    point.x *= scaleX;
                    point.y *= scaleY;
                }
            } else {
                hitbox.width = W;
                hitbox.height = H;
            }
        }
        getTouching({ ID }) {
            let target = this.hitboxes[ID];
            let touching = []; 
            if (!target) return '';
            for (let key in this.hitboxes) {
                if (key !== ID && this._checkCollision(target, this.hitboxes[key])) touching.push(key);
            }
            return touching.join(',');
        }
        getAt({ X, Y }) {
            let found = []; 
            for (let key in this.hitboxes) {
                if (this._containsPoint(this.hitboxes[key], X, Y)) found.push(key);
            }
            return found.join(',');
        }
        getBBTouching({ ID }) {
            let target = this.hitboxes[ID];
            let touching = []; 
            if (!target) return '';
            let targetBounds = this._getBoundingBox(target);
            for (let key in this.hitboxes) {
                if (key !== ID) {
                    let other = this.hitboxes[key];
                    let otherBounds = this._getBoundingBox(other);
                    if (this._rectanglesOverlap(targetBounds, otherBounds)) touching.push(key);
                }
            }
            return touching.join(',');
        }
        getBBAt({ X, Y }) {
            let found = []; 
            for (let key in this.hitboxes) {
                let bounds = this._getBoundingBox(this.hitboxes[key]);
                if (X >= bounds.x && X <= bounds.x + bounds.width && Y >= bounds.y && Y <= bounds.y + bounds.height) found.push(key);
            }
            return found.join(',');
        }
        _checkCollision(a, b) {
            if (a.type === 'circle' && b.type === 'circle') {
                let dx = a.x - b.x;
                let dy = a.y - b.y;
                let r = a.radius + b.radius;
                return dx * dx + dy * dy <= r * r;
            }
            return this._polgyonCollision(this._getTransformedPoints(a), this._getTransformedPoints(b)); 
        }
        _getTransformedPoints(hitbox) {
            let points = []; 
            let radians = -hitbox.direction * Math.PI / 180;
            for (let p of hitbox.hull.length ? hitbox.hull : this._getBoxPoints(hitbox)) {
                let nx = p.x * Math.cos(radians) - p.y * Math.sin(radians);
                let ny = p.x * Math.sin(radians) + p.y * Math.cos(radians);
                points.push({ x: nx + hitbox.x, y: ny + hitbox.y });
            }
            return points;
        }
        _polgyonCollision(a, b) {
            for (let i = 0; i < a.length; i++) {
                let j = (i + 1) % a.length;
                let p1 = a[i];
                let p2 = a[j];
                for (let k = 0; k < b.length; k++) {
                    let l = (k + 1) % b.length;
                    let p3 = b[k];
                    let p4 = b[l];
                    if (this._linesIntersect(p1, p2, p3, p4)) return true;
                }
            }
            return false;
        }
        _linesIntersect(p1, p2, p3, p4) {
            let denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
            if (Math.abs(denom) < 0.0000001) return false;
            let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p4.y - p3.y )) / denom;
            let ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p2.y - p3.y )) / denom;
            return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
        }
        _containsPoint(hitbox, x, y) {
            if (hitbox.type === 'circle') {
                let dx = x - hitbox.x;
                let dy = y - hitbox.y;
                return dx * dx + dy * dy <= hitbox.radius * hitbox.radius;
            }
            let points = this._getTransformedPoints(hitbox);
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                if (((points[i].y > y) !== (points[j].y > y)) &&
                    (x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) 
                    inside = !inside;
            }
            return inside;
        }
        _getBoxPoints(hitbox) {
            return [
                { x: -hitbox.width / 2, y: -hitbox.height / 2 },
                { x: hitbox.width / 2, y: -hitbox.height / 2 },
                { x: hitbox.width / 2, y: hitbox.height / 2 },
                { x: -hitbox.width / 2, y: hitbox.height / 2 }
            ]; 
        }
        _getBoundingBox(hitbox) {
            let points = this._getTransformedPoints(hitbox);
            let xs = points.map(p => p.x);
            let ys = points.map(p => p.y);
            return {
                x: Math.min(...xs),
                y: Math.min(...ys),
                width: Math.max(...xs) - Math.min(...xs),
                height: Math.max(...ys) - Math.min(...ys)
            };
        }
        _getHullBounds(points) {
            let xs = points.map(p => p.x);
            let ys = points.map(p => p.y);
            return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
        }
        _rectanglesOverlap(a, b) {
            return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        }
        _colorFromId(id) {
            let hash = 0;
            for (let i = 0; i < id.length; i++) {
                hash = id.charCodeAt(i) + ((hash << 5) - hash);
                hash |= 0;
            }
            let r = (hash >> 16) & 0xFF;
            let g = (hash >> 8) & 0xFF;
            let b = hash & 0xFF;
            return `rgb(${Math.abs(r)},${Math.abs(g)},${Math.abs(b)})`;
        }
        update() {
            if (!this.debugVisible) {
                requestAnimationFrame(this.update.bind(this)); 
                return;
            }
            let hitboxesArray = Object.values(this.hitboxes);
            if (hitboxesArray.length) {
                let xs = []; 
                let ys = []; 
                let xs2 = []; 
                let ys2 = []; 
                for (let hb of hitboxesArray) {
                    let bbox = this._getBoundingBox(hb);
                    xs.push(bbox.x);
                    ys.push(bbox.y);
                    xs2.push(bbox.x + bbox.width);
                    ys2.push(bbox.y + bbox.height);
                }
                let minX = Math.min(...xs);
                let minY = Math.min(...ys);
                let maxX = Math.max(...xs2);
                let maxY = Math.max(...ys2);
                let scale = Math.min(this.canvas.width / (maxX - minX || 1), this.canvas.height / (maxY - minY || 1)) * 0.9;
                this.context.setTransform(scale, 0, 0, scale, -minX * scale + this.canvas.width * 0.05, -minY * scale + this.canvas.height * 0.05);
            }
            this.context.clearRect(-10000, -10000, 20000, 20000);
            for (let id in this.hitboxes) {
                let hb = this.hitboxes[id];
                this.context.save();
                this.context.translate(hb.x, hb.y);
                this.context.rotate((hb.direction * Math.PI) / 180);
                this.context.beginPath();
                if (hb.type === 'circle') {
                    this.context.arc(0, 0, hb.radius, 0, 2 * Math.PI);
                } else if (hb.type === 'sprite') {
                    this.context.moveTo(hb.hull[0].x, hb.hull[0].y);
                    for (let point of hb.hull) {
                        this.context.lineTo(point.x, point.y);
                    }
                    this.context.closePath();
                } else {
                    this.context.rect(-hb.width / 2, -hb.height / 2, hb.width, hb.height);
                }
                this.context.strokeStyle = this._colorFromId(id);
                this.context.stroke();
                this.context.restore();
            }
            requestAnimationFrame(this.update.bind(this)); 
        }
    }
    Scratch.extensions.register(new Hitboxes(Scratch.vm)); 
})(Scratch);
