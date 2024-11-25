function setObjectLayersTo({ NAME, LAYERS }) {
    var body = bodies[NAME];
    if (!body) return '';

    var layers = LAYERS.split(' ').map(Number);
    if (!layers.length) return '';

    var categoryBits = 0;
    var maskBits = 0;

    layers.forEach(layer => {
        categoryBits |= 1 << (layer - 1);
        maskBits |= 1 << (layer - 1);
    });

    body.GetFixtureList().SetFilterData({
        categoryBits: categoryBits,
        maskBits: maskBits,
        groupIndex: 0
    });
}
