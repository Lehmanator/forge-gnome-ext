/*
 * This file is part of the Forge Window Manager extension for Gnome 3
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Credits:
 * This file has some code from Dash-To-Panel extension: convenience.js
 * Some code was also adapted from the upstream Gnome Shell source code.
 */

// Gnome imports
const Clutter = imports.gi;
const Gio = imports.gi.Gio;

// Gnome-shell imports
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

/**
 *
 * Turns an array into an immutable enum-like object
 *
 */
function createEnum(anArray) {
    const enumObj = {};
    for (const val of anArray) {
        enumObj[val] = val;
    }
    return Object.freeze(enumObj);
}


/**
 * getSettings:
 * @schema: (optional): the GSettings schema id
 *
 * Builds and return a GSettings schema for @schema, using schema files
 * in extensionsdir/schemas. If @schema is not provided, it is taken from
 * metadata['settings-schema'].
 *
 * Credits: 
 *  - Code from convenience.js script by Dash-To-Panel
 *  - See credits also on that file for further derivatives.
 */
function getSettings(schema) {
    let extension = ExtensionUtils.getCurrentExtension();

    schema = schema || extension.metadata['settings-schema'];

    const GioSSS = Gio.SettingsSchemaSource;

    // Check if this extension was built with "make zip-file", and thus
    // has the schema files in a subfolder
    // otherwise assume that extension has been installed in the
    // same prefix as gnome-shell (and therefore schemas are available
    // in the standard folders)
    let schemaDir = extension.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null))
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                                                 GioSSS.get_default(),
                                                 false);
    else
        schemaSource = GioSSS.get_default();

    let schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj)
        throw new Error('Schema ' + schema + 
            ' could not be found for extension ' + extension.metadata.uuid + 
            '. Please check your installation.');

    return new Gio.Settings({
        settings_schema: schemaObj
    });
}

function resolveX(action, metaWindow) {
    let metaRect = metaWindow.get_frame_rect();
    let monitorRect = metaWindow.get_work_area_current_monitor();
    let val = metaRect.x;
    let x = action.x;
    switch (typeof x) {
        case 'string': //center,
            switch (x) {
                case 'center':
                    val = (monitorRect.width * 0.5) - (this.resolveWidth(action, metaWindow) * 0.5);
                    break;
                case 'left':
                    val = 0;
                    break;
                case 'right':
                    val = monitorRect.width - this.resolveWidth(action, metaWindow);
                    break;
                default:
                    break;
            }
            break;
        case 'number':
            val = x;
            break;
        default:
            break;
    }
    return val;
}

function resolveY(action, metaWindow) {
    let metaRect = metaWindow.get_frame_rect();
    let monitorRect = metaWindow.get_work_area_current_monitor();
    let val = metaRect.y;
    let y = action.y;
    switch (typeof y) {
        case 'string': //center,
            switch (y) {
                case 'center':
                    val = (monitorRect.height * 0.5) - (this.resolveHeight(action, metaWindow) * 0.5);
                    break;
                case 'top':
                    val = 0;
                    break;
                case 'bottom': // inverse of y=0
                    val = monitorRect.height - this.resolveHeight(action, metaWindow);
                    break;
                default:
                    break;
            }
            break;
        case 'number':
            val = y;
            break;
        default:
            break;
    }
    return val;
}

function resolveWidth(action, metaWindow) {
    let metaRect = metaWindow.get_frame_rect();
    let monitorRect = metaWindow.get_work_area_current_monitor();
    let val = metaRect.width;
    let width = action.width;
    switch (typeof width) {
        case 'number':
            if (Number.isInteger(width) && width != 1) {
                val = width;
            } else {
                let monitorWidth = monitorRect.width;
                val = monitorWidth * width;
            }
            break;
        default:
            break;
    }
    return val;
}

function resolveHeight(action, metaWindow) {
    let metaRect = metaWindow.get_frame_rect();
    let monitorRect = metaWindow.get_work_area_current_monitor();
    let val = metaRect.height;
    let height = action.height;
    switch (typeof height) {
        case 'number':
            if (Number.isInteger(height) && height != 1) {
                val = height;
            } else {
                let monitorHeight = monitorRect.height;
                val = monitorHeight * height;
            }
            break;
        default:
            break;
    }
    return val;
}
