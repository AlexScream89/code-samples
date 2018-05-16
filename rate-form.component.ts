import { Component, Input } from '@angular/core';
import { LocalStorageService } from "angular-2-local-storage";
import { ActivatedRoute, Params } from "@angular/router";
import { InventionService } from "../../../views/invention/services/invention.service";

@Component({
    selector: 'rate-form',
    templateUrl: './rate-form.component.html',
    styles: [String(require('./rate-form.component.scss'))]
})

export class RateFormComponent {
    @Input() caseId: any = null;
    @Input() workflowStatus;
    @Input() posts;

    private rateData: any;
    private rateArray: Array<any> = [];
    private inventionId: any;
    private patentId: any;
    private rateTime: any;
    private sessionData: any;
    private fullName: string;
    private selectedRate: number = 0;
    private isLoadingRate: boolean = true;
    private post;

    constructor(
        private route: ActivatedRoute,
        private localStorageService: LocalStorageService,
        private inventionService: InventionService
    ) {}

    ngOnChanges() {
        this.selectedRate = 0;
        this.initPanel();
    }

    public initPanel(): void {
        this.getRouteParams();
        if (this.workflowStatus && this.workflowStatus == 'Coordinator') {
            this.getRates();
            this.getTime();
            this.getFullName();
        }
        if (this.posts) {
            this.initRate();
        }
    }

    public getRouteParams(): void {
        this.route.params.forEach((params: Params) => {
            this.inventionId = params['inventionId'];
            this.patentId = params['patentId'];
        });
    }

    public getTime(): void {
        this.rateTime = new Date();
    }

    public getFullName(): void {
        this.sessionData = this.localStorageService.get('session');
        this.fullName = `${this.sessionData['first_name']} ${this.sessionData['last_name']}`;
    }

    public getRates(): void {
        let id = +this.inventionId;

        this.rateData = this.localStorageService.get('inventionRate');
        if (this.rateData) {
            let index = this.rateData.findIndex(element => element.invention_id === id);
            if (index == -1) {
                this.rateArray = null;
            } else {
                this.rateArray = this.rateData[index]['rates'];
                if (this.rateArray.length > 0) {
                    this.inventionService.openResultWorkflow(true);
                }
            }
        } else {
            this.rateArray = null;
        }
    }

    public initRate(): void {
        if (this.rateArray && this.workflowStatus == 'Coordinator') {
            let index = this.rateArray.findIndex(element => element.case_id === this.caseId);
            if (index != -1) {
                this.selectedRate = this.rateArray[index]['value'];
            }
        } else {
            let index = this.posts.findIndex(element => element.case_id === this.caseId);
            if (index != -1) {
                this.post = this.posts[index];
                if (this.post.rated_by) {
                    this.fullName = `${this.post.rated_by.data.first_name} ${this.post.rated_by.data.last_name}`
                }
            }
        }
        this.isLoadingRate = false;
    }

    public checkRate(rate: number): void {
        this.rateData = this.localStorageService.get('inventionRate');

        let inventionRate = {
            invention_id: +this.inventionId,
            rates: [
                {
                    case_id: this.caseId,
                    value: rate
                }
            ]
        };

        if (!this.rateData) {
            let inventionData = [];
            inventionData.push(inventionRate);
            this.localStorageService.set('inventionRate', inventionData);
        } else {
            let index = this.rateData.findIndex(element => element.invention_id == this.inventionId);
            if (index == -1) {
                this.rateData.push(inventionRate);
            } else {
                this.rateData[index]['rates'].push({case_id: this.caseId, value: rate});
            }
            this.localStorageService.set('inventionRate', this.rateData);
        }

        this.inventionService.openResultWorkflow(true);
        this.selectedRate = rate;
    }

    public removeRate(): void {
        this.rateData = this.localStorageService.get('inventionRate');
        let index = this.rateData.findIndex(element => element.invention_id == this.inventionId);
        let indexRate = this.rateData[index]['rates'].findIndex(element => element.case_id === this.caseId);
        this.rateData[index]['rates'].splice(indexRate, 1);

        this.localStorageService.set('inventionRate', this.rateData);
        if (this.rateData[index]['rates'].length < 1) {
            this.inventionService.openResultWorkflow(false);
        }

        this.selectedRate = 0;
    }

}