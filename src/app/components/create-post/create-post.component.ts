import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit, OnDestroy {
  destroy$: Subject<null> = new Subject();
  postForm: FormGroup;
  imagePreviewSrc: string | ArrayBuffer;
  image: any = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly storage: AngularFireStorage,
  ) {}

  ngOnInit(): void {
    this.postForm = this.formBuilder.group({
      title: [null, Validators.required],
      description: [null, Validators.required],
      body: [null, Validators.required],
      imageUrl: [null, Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null)
  }

  onSubmit(formData): void {
    console.warn('Your Post has been submitted', formData);
    if (this.image !== null) {
      const filePath = `posts/${this.image.name.split('.').slice(0, -1)}-${new Date().getTime()}`;
      this.storage.upload(filePath, this.image).snapshotChanges().pipe(
        finalize(() => {
          this.storage.ref(filePath).getDownloadURL().subscribe(url => {
            console.log('Uploaded URL:', url)
            const params = {
              ...formData,
              imageUrl: url
            }
            console.log(params)
            // Make API call to server to submit the params
            this.postForm.reset();
          })
        })
      ).subscribe()
    }
  }

  showPreview(event): void {
    console.log('File chosen', event)
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => this.imagePreviewSrc = e.target.result
      reader.readAsDataURL(event.target.files[0])
      this.image = event.target.files[0]
    } else {
      this.imagePreviewSrc = ''
      this.image = null
    }
  }
}
