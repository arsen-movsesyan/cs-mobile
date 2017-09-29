/*
 * Created by Arsen Movsesyan on 8/8/17.
 */
export class InventoryPartModel {
    constructor(
        public id: number,
        public organization: number,
        public part_number: string,
        public part_name: string,
        public description: string,
        public cost: number,
        public part_status: number
    ) {}
}
