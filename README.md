# FirebaseUpload

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.2.
- Use Angular Routing: Yes
- Stylesheet Format: CSS

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Firebase upload configuration
- Install `firebase` and `firebase-tools`
```bash
$ npm install firebase
$ npm install --only=dev firebase-tools
```
- Login to firebase
```bash
$ ./node_modules/.bin/firebase login --no-localhost
```
- Configure `environment.ts`
```ts
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'YOUR apiKey HERE',
    authDomain: 'YOUR authDomain HERE',
    databaseURL: 'YOUR databaseURL HERE',
    projectId: 'YOUR projectId HERE',
    storageBucket: 'YOUR storageBucket HERE',
    messagingSenderId: 'YOUR messagingSenderId HERE',
    appId: 'YOUR appId HERE',
    measurementId: 'YOUR measurementId HERE',
  },
};
```
- Add `@angular/fire` by `ng` command. Choose the Firebase project during the process if is being asked
```bash
$ ng add @angular/fire
```
- Generate a module called AppFirebaseModule
```bash
$ ng g m app-firebase
```
- Add more code to `app/app-firebase/app-firebase.module.ts` file
```diff
  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
+ import { AngularFireModule } from '@angular/fire';
+ import { environment } from '../../environments/environment';


  @NgModule({
    declarations: [],
    imports: [
      CommonModule,
+     AngularFireModule.initializeApp(environment.firebaseConfig)
    ],
+   exports: [AngularFireModule],
  })
  export class AppFirebaseModule { }
```
- Import to `AppModule`
```diff
  import { BrowserModule } from '@angular/platform-browser';
  import { NgModule } from '@angular/core';
  import { AppRoutingModule } from './app-routing.module';
  import { AppComponent } from './app.component';
  import { CreatePostComponent } from './components/create-post/create-post.component';
+ import { AppFirebaseModule } from './app-firebase/app-firebase.module';

  @NgModule({
    declarations: [
      AppComponent,
      CreatePostComponent,
    ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      ReactiveFormsModule,
+     AppFirebaseModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
  })
  export class AppModule { }
```
- Restart the app server and confirm the app works

## Firebase upload preparation
Suppose we have a component `CreatePost` as follows:
```ts
// src/app/components/create-post/create-post.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit, OnDestroy {
  destroy$: Subject<null> = new Subject();
  postForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {}

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
    this.postForm.reset();

    console.warn('Your Post has been submitted', formData);
  }
}
```
```html
<!-- src/app/components/create-post/create-post.component.html -->
<h2>Create Post</h2>

<form [formGroup]="postForm" (ngSubmit)="onSubmit(postForm.value)">
  <div>
    <dt><label for="title">Title</label></dt>
    <dd><input id="title" type="text" formControlName="title"></dd>
  </div>
  <div>
    <dt><label for="description">Description</label></dt>
    <dd><input id="description" type="text" formControlName="description"></dd>
  </div>
  <div>
    <dt><label for="body">Body</label></dt>
    <dd><textarea id="body" type="text" formControlName="body"></textarea></dd>
  </div>
  <div>
    <dt><label for="image">Image</label></dt>
    <dd>
      <input
        id="image"
        type="text"
        formControlName="imageUrl"
      >
    </dd>
  </div>
  <div><dd><button class="button" type="submit">Create Post</button></dd></div>
</form>
```

- Change the HTML to allow file upload
```diff
<!-- src/app/components/create-post/create-post.component.html -->

  <div>
    <dt><label for="image">Image</label></dt>
    <dd>
      <input
        id="image"
-       type="text"
+       type="file"
-       formControlName="imageUrl"
+       (change)="showPreview($event)"
      >
    </dd>
  </div>
```
- Add dummy preview handler
```diff
// src/app/components/create-post/create-post.component.ts

  onSubmit(formData): void {
    console.warn('Your Post has been submitted', formData);
    this.postForm.reset();
  }

+ showPreview(event): void {
+   console.log('File chosen', event)
+ }
```
- Confirm the app still works. Try to choose a file and see the log
- Make a preview works by:
```diff
// src/app/components/create-post/create-post.component.ts
  export class CreatePostComponent implements OnInit, OnDestroy {
    destroy$: Subject<null> = new Subject();
    postForm: FormGroup;
+   imagePreviewSrc: string | ArrayBuffer;

  ...

  showPreview(event): void {
    console.log('File chosen', event)
+   if (event.target.files && event.target.files[0]) {
+     const reader = new FileReader()
+     reader.onload = (e) => this.imagePreviewSrc = e.target.result
+     reader.readAsDataURL(event.target.files[0])
+   } else {
+     this.imagePreviewSrc = ''
+   }
  }
```
- And change the view
```diff
<!-- src/app/components/create-post/create-post.component.html -->

  <div>
    <dt><label for="image">Image</label></dt>
    <dd>
      <input
        id="image"
        type="file"
        (change)="showPreview($event)"
+       #imageUploader
      >
    </dd>
+   <img [src]="imagePreviewSrc" (click)="imageUploader.click()" />
  </div>
```
- Try to choose an image to see preview works
- Form now on, your application is ready to upload a file. Continue with section below to see how to upload to Firebase Storage

## Firebase upload implementation
- Go to page Google Firebase Console > Storage > Get Started > Choose `asia-east2` region > Done (If you already do this step, no problem.)
- Choose tab [Rules] > Click to `Edit Rules` > Change to below and click `Publish`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read
      allow write
    }
  }
}
```
- Change the `CreatePostComponent`
```diff
  // src/app/components/create-post/create-post.component.ts

  import { Component, OnInit, OnDestroy } from '@angular/core';
+ import { AngularFireStorage } from '@angular/fire/storage';
  ...

  @Component({
    selector: 'app-create-post',
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.css']
  })
  export class CreatePostComponent implements OnInit, OnDestroy {
    destroy$: Subject<null> = new Subject();
    postForm: FormGroup;
    imagePreviewSrc: string | ArrayBuffer;
+   image: any = null;

-   constructor(private readonly formBuilder: FormBuilder) {}
+   constructor(
+     private readonly formBuilder: FormBuilder,
+     private readonly storage: AngularFireStorage,
+   ) {}

    ...

    onSubmit(formData): void {
      console.warn('Your Post has been submitted', formData);
+     if (this.image !== null) {
+       const filePath = `posts/${this.image.name.split('.').slice(0, -1)}-${new Date().getTime()}`;
+       this.storage.upload(filePath, this.image).snapshotChanges().pipe(
+         finalize(() => {
+           this.storage.ref(filePath).getDownloadURL().subscribe(url => {
+             console.log('Uploaded URL:', url)
+             this.postForm.reset();
+           })
+         })
+       ).subscribe()
+     }
-     this.postForm.reset();
    }

    showPreview(event): void {
      console.log('File chosen', event)
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => this.imagePreviewSrc = e.target.result
        reader.readAsDataURL(event.target.files[0])
+       this.image = event.target.files[0]
      } else {
        this.imagePreviewSrc = ''
+       this.image = null
      }
    }
  }
```
- Now choose the file and click [Submit], see the log and you can see the URL. Tada
- Finalize, make your submission logic works 
```diff
  // src/app/components/create-post/create-post.component.ts
  ...

    onSubmit(formData): void {
      console.warn('Your Post has been submitted', formData);
      if (this.image !== null) {
        const filePath = `posts/${this.image.name.split('.').slice(0, -1)}-${new Date().getTime()}`;
        this.storage.upload(filePath, this.image).snapshotChanges().pipe(
          finalize(() => {
            this.storage.ref(filePath).getDownloadURL().subscribe(url => {
              console.log('Uploaded URL:', url)
+             const params = {
+               ...formData,
+               imageUrl: url
+             }
+             console.log('Params', params)
+             // Make API call to server to submit the params
              this.postForm.reset();
            })
          })
        ).subscribe()
      }
    }
    ...
```