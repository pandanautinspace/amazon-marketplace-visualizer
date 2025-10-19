const building1Images = require.context('../../../assets/spritesheets/buildings/building_1', false, /\.png$/);
const building2Images = require.context('../../../assets/spritesheets/buildings/building_2', false, /\.png$/);
const building3Images = require.context('../../../assets/spritesheets/buildings/building_3', false, /\.png$/);
const building4Images = require.context('../../../assets/spritesheets/buildings/building_4', false, /\.png$/);
const building5Images = require.context('../../../assets/spritesheets/buildings/building_5', false, /\.png$/);
const building6Images = require.context('../../../assets/spritesheets/buildings/building_6', false, /\.png$/);
const building7Images = require.context('../../../assets/spritesheets/buildings/building_7', false, /\.png$/);
const building8Images = require.context('../../../assets/spritesheets/buildings/building_8', false, /\.png$/);
const building9Images = require.context('../../../assets/spritesheets/buildings/building_9', false, /\.png$/);
const building10Images = require.context('../../../assets/spritesheets/buildings/building_10', false, /\.png$/);
const building11Images = require.context('../../../assets/spritesheets/buildings/building_11', false, /\.png$/);
const building12Images = require.context('../../../assets/spritesheets/buildings/building_12', false, /\.png$/);
const building13Images = require.context('../../../assets/spritesheets/buildings/building_13', false, /\.png$/);
const building14Images = require.context('../../../assets/spritesheets/buildings/building_14', false, /\.png$/);
const building15Images = require.context('../../../assets/spritesheets/buildings/building_15', false, /\.png$/);
const building16Images = require.context('../../../assets/spritesheets/buildings/building_16', false, /\.png$/);
const building17Images = require.context('../../../assets/spritesheets/buildings/building_17', false, /\.png$/);
const building18Images = require.context('../../../assets/spritesheets/buildings/building_18', false, /\.png$/);

const decorImages = require.context('../../../assets/spritesheets/decor', false, /\.png$/);
const landImages = require.context('../../../assets/spritesheets/land', false, /\.png$/);
const roadImages = require.context('../../../assets/spritesheets/road', false, /\.png$/);

const getImagesFromContext = (context) => context.keys().map(context);

export const rawSpritesheetLocs = {
    buildings: {
        1: getImagesFromContext(building1Images),
        2: getImagesFromContext(building2Images),
        3: getImagesFromContext(building3Images),
        4: getImagesFromContext(building4Images),
        5: getImagesFromContext(building5Images),
        6: getImagesFromContext(building6Images),
        7: getImagesFromContext(building7Images),
        8: getImagesFromContext(building8Images),
        9: getImagesFromContext(building9Images),
        10: getImagesFromContext(building10Images),
        11: getImagesFromContext(building11Images),
        12: getImagesFromContext(building12Images),
        13: getImagesFromContext(building13Images),
        14: getImagesFromContext(building14Images),
        15: getImagesFromContext(building15Images),
        16: getImagesFromContext(building16Images),
        17: getImagesFromContext(building17Images),
        18: getImagesFromContext(building18Images),
    },
    decor: getImagesFromContext(decorImages),
    land: getImagesFromContext(landImages),
    road: getImagesFromContext(roadImages),
};

export const chromeSpriteSheetLocs = {
    buildings: Object.fromEntries(
        Object.entries(rawSpritesheetLocs.buildings).map(([key, locs]) => [
            key,
            locs.map((loc) => chrome.runtime.getURL(loc))
        ])
    ),
    decor: rawSpritesheetLocs.decor.map((loc) => chrome.runtime.getURL(loc)),
    land: rawSpritesheetLocs.land.map((loc) => chrome.runtime.getURL(loc)),
    road: rawSpritesheetLocs.road.map((loc) => chrome.runtime.getURL(loc)),
}

