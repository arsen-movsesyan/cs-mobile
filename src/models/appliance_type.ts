/*
 * Created by Arsen Movsesyan on 8/4/17.
 */
export class ApplianceTypeModel {
    constructor(
        public id: number,
        public appliance: string,
        public home_place: string,
        public comment: string
    ) {}
}
