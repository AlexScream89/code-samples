import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SimpleUser } from '../../core/models/simple-user.model';
import { PersonalPlansService } from '../shared/providers/personal-plans.service';

@Component({
    selector: 'lt-all-personal-plans',
    templateUrl: './all-personal-plans.component.html',
    styleUrls: ['all-personal-plans.component.scss']
})

export class AllPersonalPlansComponent implements OnInit {
    public isLoadSearch = false;
    public isLoadNext = false;
    public plans: SimpleUser[];
    public searchForm: FormGroup = new FormGroup({
        search: new FormControl('', Validators.required)
    });
    public currentPage = 1;
    private hasNextPage: boolean;

    constructor(
        private route: ActivatedRoute,
        private personalPlansService: PersonalPlansService
    ) {
        const plansData = this.route.snapshot.data['plans'];
        this.plans = plansData.results;
        this.hasNextPage = !!plansData.next;
    }

    ngOnInit() {
        this.onSearchFormChange();
    }

    public getNextPlans(): void {
        if (!this.hasNextPage || this.isLoadNext) {
            return;
        }

        this.isLoadNext = true;
        this.personalPlansService.getAll(++this.currentPage).subscribe(
            res => {
                this.hasNextPage = !!res.next;
                this.plans.push(...res.results);
                this.isLoadNext = false;
            },
            err => {
                this.isLoadNext = false;
                this.hasNextPage = false;
            }
        );
    }

    private onSearchFormChange(): void {
        this.searchForm.valueChanges
            .debounceTime(400)
            .subscribe((value) => this.onChangeSearch(value.search.trim()));
    }

    public resetForm(): void {
        this.searchForm.patchValue({search: ''});
    }

    private onChangeSearch(query: string): void {
        this.isLoadSearch = true;
        this.personalPlansService.getAll(1, query).subscribe(
            res => {
                this.currentPage = 1;
                this.hasNextPage = !!res.next;
                this.plans = res.results;
                this.isLoadSearch = false;
            },
            err => {
                this.isLoadSearch = false;
            }
        );
    }
}
