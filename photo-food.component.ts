import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { PhotoFoodService } from '../../services/photo-food.service';
import { ChatService } from '../../services/chat.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subject } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-photo-food',
    templateUrl: './photo-food.component.html',
    styleUrls: ['./photo-food.component.scss']
})
export class PhotoFoodComponent implements OnDestroy {

    @ViewChild('fileInput') fileInput: any;

    public url;
    public image: AbstractControl;
    public comment: AbstractControl;
    public form: FormGroup;
    public isSubmitted = false;
    public userId: string;
    public adviserId: string;
    public photoPath: string;
    public isPhotoSaving = false;
    private stopSubscribe = new Subject();

    constructor(
        private photoFoodService: PhotoFoodService,
        private chatService: ChatService,
        private usersService: UsersService,
        private fb: FormBuilder,
        private toasts: ToastrService,
        private vcr: ViewContainerRef,
        private afAuth: AngularFireAuth
    ) {
        this.initForm();
        this.initUser();
    }

    ngOnDestroy() {
        this.stopSubscribe.next();
    }

    public onSubmit(values): void {
        this.isSubmitted = true;
        if (!this.form.valid || !this.form.value.image) {
            this.toasts.warning('Please add photo', 'Warning!', { closeButton: true });
            return;
        }
        this.savePhoto(values);
    }

    public readUrl(event): void {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev: any) => {
                this.url = ev.target.result;
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    public removeImage(): void {
        this.url = '';
        this.fileInput.nativeElement.value = '';
        this.form.value.image = null;
    }

    private initForm(): void {
        this.form = this.fb.group({
            'comment': [null],
            'image': [null, Validators.required],
        });
        this.image = this.form.controls['image'];
        this.comment = this.form.controls['comment'];
    }

    private sendMessageToAdviser(): void {
        if (!this.adviserId) {
            return;
        }
        const data = {
            message: this.photoPath,
            from: this.userId,
            type: 'photo-food'
        };
        this.chatService.addMessages(this.userId, this.adviserId, data);
    }

    private initUser(): void {
        this.afAuth.authState.pipe(
            takeUntil(this.stopSubscribe))
            .subscribe(user => {
                if (!user) {
                    return;
                }
                this.userId = user.uid;
                this.getUserData();
            });
    }

    private getUserData(): void {
        this.usersService.getUserProfile(this.userId)
            .pipe(takeUntil(this.stopSubscribe))
            .subscribe((user: any) => this.adviserId = user.subscribedto);
    }

    private savePhoto(values): void {
        this.isPhotoSaving = true;
        this.photoFoodService.addPhoto(values).then(data => {
            this.photoPath = data;
            this.sendMessageToAdviser();
            this.isSubmitted = false;
            this.form.reset();
            this.url = '';
            this.isPhotoSaving = false;
        });
    }

}
