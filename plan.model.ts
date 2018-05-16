import { SimpleUser } from '../../../core/models/simple-user.model';

export class Plan extends SimpleUser {
    public goal: string;
    public specialization: string;

    constructor(data) {
        super(data.owner);
        this.goal = data.goal;
        this.specialization = data.owner.specialization;
    }
}
