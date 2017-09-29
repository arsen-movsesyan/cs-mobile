/*
 * Created by Arsen Movsesyan on 8/8/17.
 */
import {InventoryPartModel} from './inventory_part';

export class InstalledPartModel {
    constructor(
        public id: number,
        public inventory_part: InventoryPartModel
    ) {
    }
}
