"use strict";
var fs = require('fs');
var m_Undolength = 0;
var m_Undo = new Array(4);
var m_RecordTile = new editor.Tile;
for (var i = 0; i < 3; i++) {
    m_Undo[i] = new Array();
}
function readFile() {
    var map_path = __dirname + "/map.json";
    var content = fs.readFileSync(map_path, "utf-8");
    var obj = JSON.parse(content);
    var mapData = obj.map;
    return mapData;
}
function writeFile() {
    console.log(mapData);
    var map_path = __dirname + "/map.json";
    var json = "{\"map\":" + JSON.stringify(mapData) + "}";
    fs.writeFileSync(map_path, json, "utf-8");
}
function UndoTile() {
    if (m_Undolength <= 0) {
        alert("Ended");
        return;
    }
    else {
        var new_row = m_Undo[0][m_Undolength - 1];
        var new_col = m_Undo[1][m_Undolength - 1];
        mapData[new_row][new_col] = m_Undo[2][m_Undolength - 1];
        m_Undolength--;
        m_RecordTile.setWalkable(mapData[new_row][new_col]);
    }
}
function createMapEditor() {
    var world = new editor.WorldMap();
    var rows = mapData.length;
    var cols = mapData[0].length;
    for (var col = 0; col < rows; col++) {
        for (var row = 0; row < cols; row++) {
            var tile = new editor.Tile();
            tile.setWalkable(mapData[row][col]);
            tile.x = col * editor.GRID_PIXEL_WIDTH;
            tile.y = row * editor.GRID_PIXEL_HEIGHT;
            tile.ownedCol = col;
            tile.ownedRow = row;
            tile.width = editor.GRID_PIXEL_WIDTH;
            tile.height = editor.GRID_PIXEL_HEIGHT;
            world.addChild(tile);
            eventCore.register(tile, events.displayObjectRectHitTest, onTileClick);
        }
    }
    return world;
}
var m_buttonSave = new render.Bitmap();
m_buttonSave.width = 50;
m_buttonSave.height = 50;
m_buttonSave.source = "Save.png";
m_buttonSave.x = 250;
m_buttonSave.y = 0;
var Save = function (localPoint, displayObject) {
    if (localPoint.x >= 0 && localPoint.x <= m_buttonSave.width && localPoint.y >= 0 && localPoint.y <= m_buttonSave.height)
        return true;
};
function onSaveClick() {
    writeFile();
    console.log("Save");
}
var m_buttonUndo = new render.Bitmap();
m_buttonUndo.width = 50;
m_buttonUndo.height = 50;
m_buttonUndo.source = "Cannel.png";
m_buttonUndo.x = 320;
m_buttonUndo.y = 0;
var Cannel = function (localPoint, displayObject) {
    if (localPoint.x >= 0 && localPoint.x <= m_buttonUndo.width && localPoint.y >= 0 && localPoint.y <= m_buttonUndo.height)
        return true;
};
function onCannelClick() {
    UndoTile();
    console.log("Cannel");
}
function onTileClick(tile) {
    console.log(tile.ownedRow + " " + tile.ownedCol + " " + mapData[tile.ownedRow][tile.ownedCol]);
    m_Undo[0][m_Undolength] = tile.ownedRow;
    m_Undo[1][m_Undolength] = tile.ownedCol;
    m_Undo[2][m_Undolength] = mapData[tile.ownedRow][tile.ownedCol];
    m_Undolength++;
    if (mapData[tile.ownedRow][tile.ownedCol] == 0)
        mapData[tile.ownedRow][tile.ownedCol] = 1;
    else
        mapData[tile.ownedRow][tile.ownedCol] = 0;
    tile.setWalkable(mapData[tile.ownedRow][tile.ownedCol]);
    stage.addChild(StatusBUr(tile));
    m_RecordTile = tile;
    console.log(tile);
}
function StatusBUr(tile) {
    var Container = new render.DisplayObjectContainer();
    var m_CanPassOrNot = new ui.Button();
    Container.x = 250;
    Container.y = 50;
    //var m_bitmap=new render.Bitmap();
    //m_bitmap.source = "Save.png";
    var X = tile.ownedRow + 1;
    var Y = tile.ownedCol + 1;
    var m_postion = new ui.Button();
    m_CanPassOrNot.width = 100;
    m_CanPassOrNot.height = 30;
    m_postion.x = 10;
    m_postion.y = 10;
    m_postion.text = X + ' 行 ' + Y + ' 列 ';
    //m_postion.source = m_bitmap;
    Container.addChild(m_postion);
    m_CanPassOrNot.width = 100;
    m_CanPassOrNot.height = 30;
    m_CanPassOrNot.x = 10;
    m_CanPassOrNot.y = 50;
    // m_CanPassOrNot.source = m_bitmap;
    var m_Background = new render.Rect();
    m_Background.width = 50;
    m_Background.height = 50;
    m_Background.x = 10;
    m_Background.y = 130;
    if (mapData[tile.ownedRow][tile.ownedCol] == 0) {
        m_CanPassOrNot.text = "可走";
        m_Background.color = "#FF0000";
    }
    else {
        m_CanPassOrNot.text = "不可走";
        m_Background.color = "#0000FF";
    }
    m_CanPassOrNot.onClick = function () {
        onTileClick(tile);
    };
    Container.addChild(m_CanPassOrNot);
    Container.addChild(m_Background);
    return Container;
}
var storage = data.Storage.getInstance();
storage.readFile();
var mapData = storage.mapData;
var renderCore = new render.RenderCore();
var eventCore = events.EventCore.getInstance();
eventCore.init();
var mapEditor = createMapEditor();
var stage = new render.DisplayObjectContainer();
stage.addChild(mapEditor);
var panel = new editor.ControlPanel();
panel.x = 300;
stage.addChild(panel);
stage.addChild(m_buttonSave);
stage.addChild(m_buttonUndo);
//stage.addChild(StatusBUr(m_RecordTile));
renderCore.start(stage, ["Save.png", "Cannel.png"]);
eventCore.register(m_buttonSave, Save, onSaveClick);
eventCore.register(m_buttonUndo, Cannel, onCannelClick);
renderCore.start(stage);
