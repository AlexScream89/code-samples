import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '../../../shared/providers/errors.service';
import { ConfigService } from '../../../core/providers/config.service';
import { Plan } from '../models/plan.model';
import { SharedPlan } from '../models/shared-plan.model';
import { OwnPlanModel } from '../models/own-plan.model';
import { User } from '../../../core/models/user.model';

@Injectable()
export class PersonalPlansService {

  constructor(
      private http: HttpClient,
      private errorService: ErrorService
  ) {}

  public getAll(page: number = 1, user?: string) {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    if (user) {
      params = params.append('name', user);
    }

    return this.http.get(ConfigService.allPlansPath, {params: params})
      .map((response: any) => {
        response.results = response.results.map((res) => new Plan(res));
        return response;
      })
      .catch((err) => this.errorService.getErrors(err));
  }

  public getAvailable() {
    return this.http.get(ConfigService.availablePlansPath)
      .map((response: any) => {
        if (response.hasOwnProperty('mentoring')) {
          response.mentoring = response.mentoring.map((res) => new Plan(res));
        }
        if (response.hasOwnProperty('shared')) {
          response.shared = response.shared.map((res) => new Plan(res));
        }

        return response;
      })
      .catch((err) => this.errorService.getErrors(err));
  }

  public getOwn(id: number) {
    return this.http.get(ConfigService.availablePlansPath + `${id}/`)
      .map((response: any) => {
        // console.log('respons', response);
        return new OwnPlanModel(response);
      })
      .catch((err) => this.errorService.getErrors(err));
  }

  public getSharedUsers(id: number) {
    return this.http.get(ConfigService.availablePlansPath + `${id}/share/`)
      .map((response: any) => {
        response = response.map(res => new SharedPlan(res));

        return response;
      })
      .catch((err) => this.errorService.getErrors(err));
  }

  public sharedTo(id: number, body: any) {
    return this.http.post(ConfigService.availablePlansPath + `${id}/share/`, body)
      .map((response: any) => {
        return response;
      })
      .catch((err) => this.errorService.getErrors(err));
  }

  public removeShare(id: number) {
    return this.http.delete(ConfigService.availablePlansPath + `share/${id}/`)
      .map((response: any) => {
        return response;
      })
      .catch((err) => this.errorService.getErrors(err));
  }

}