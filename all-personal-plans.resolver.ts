import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { PersonalPlansService } from '../../../shared/providers/personal-plans.service';

@Injectable()

export class AllPersonalPlansResolver implements Resolve<any> {
    constructor(private personalPlansService: PersonalPlansService) {}
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.personalPlansService.getAll();
    }
}
