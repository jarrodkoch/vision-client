import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { Component } from '@angular/core';
import { Headers, Http } from "@angular/http";
import { NavController } from 'ionic-angular';
import { Camera, Transfer } from 'ionic-native';
declare var ImageResizer: any;
@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  base64Image: string;
  imageData: string;
  cookie: string;
  assetClass: string;
  description: string;
  error: string;
  mutcd: string;
  text: string;
  quality: number;
  width: number;
  height: number;

  constructor(public navCtrl: NavController, private http: Http) {
    this.quality = 25;
    this.width = 960;
    this.height = 1280;
  }

  takePicture(){
    Camera.getPicture({
        destinationType: Camera.DestinationType.NATIVE_URI,
        quality: this.quality,
        targetWidth: this.width,
        targetHeight: this.height
    }).then((imageData) => {
      // imageData is a base64 encoded string
        this.imageData = imageData;
        this.base64Image = "data:image/jpeg;base64," + imageData;
    }, (err) => {
        console.log(err);
    });
  }

  authenticate() {
    this.post(`http://kochjarrod.cartegraph.com/Cartegraph/api/v1/authenticate`, { username: 'Jerry', password: 'Bazinga$$' })
      .subscribe(result => {
        this.cookie = (result as any).Cookie;
      }, err => {
        console.log(err);
      });
  }

  sendPicture() {
    this.upload(this.imageData);
    // this.convertToImage();

    // var img = this.dataURItoBlob(this.base64Image);

    // this.post(`http://kochjarrod.cartegraph.com/Cartegraph/api/v1/attachments/cgPavementClass/1893998850/cgPavement_cgAttachmentsClass/?fileName=foo.jpg`, {file: img})
    //   .subscribe(response => {
    //     console.log('yay');
    //   }, err => {
    //     console.log('boo');
    //   });
  }

  convertToImage() {
    var canvas, context, image, imageData;
    canvas = document.createElement('canvas');
    canvas.width = 470;
    canvas.height = 470;
    context = canvas.getContext('2d');
    image = new Image();
    var that = this;

    image.addEventListener('load', function(){
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        that.post(`http://kochjarrod.cartegraph.com/Cartegraph/api/v1/attachments/identifyimage`, { file: imageData })
          .subscribe(response => {
            console.log('yay');
          }, err => {
            console.log('boo');
          });
    }, false);
    image.src = this.base64Image;
  }

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
  }

  post<T>(url: string, data: any): Observable<T> {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    return this.http.post(url, JSON.stringify(data), {
      headers: headers
    }).map(resp => resp.json());
  }

  postFile<T>(url: string, body: any): Observable<T> {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    return this.http.post(url, body, {
      headers: headers
    }).map(resp => resp.json());
  }

  upload(image: string) {
      this.assetClass = '';
      this.description = '';
      this.error = '';
      this.mutcd = '';
      this.text = '';
        let ft = new Transfer();
        let filename = "foo.jpg";
        let options = {
            fileKey: 'file',
            fileName: filename,
            mimeType: 'image/jpeg',
            chunkedMode: false,
            headers: {
                'Content-Type' : undefined
            },
            params: {
                fileName: filename
            }
        };
        ft.upload(image, "http://kochjarrod.cartegraph.com/Cartegraph/api/v1/attachments/identifyimage", options, false)
        .then((result: any) => {
          let response = JSON.parse(result.response);
          this.assetClass = response.assetClass;
          this.description = response.description;
          this.mutcd = response.mutcd;
          this.error = response.error;
          this.text = response.text;
        }).catch((error: any) => {
          console.log(error);
        });
    }

    sendAttachment() {
        let ft = new Transfer();
        let filename = "foo.jpg";
        let options = {
            fileKey: 'file',
            fileName: filename,
            mimeType: 'image/jpeg',
            chunkedMode: false,
            headers: {
                'Content-Type' : undefined
            },
            params: {
                fileName: filename
            }
        };
        ft.upload(this.imageData, "http://kochjarrod.cartegraph.com/Cartegraph/api/v1/attachments/cgPavementClass/1893998850/cgPavement_cgAttachmentsClass/?fileName=foo.jpg", options, false)
        .then((result: any) => {
          console.log(result);
        }).catch((error: any) => {
          console.log(error);
        });
    }

    resize() {
      var options = {
        uri: this.imageData,
        folderName: "Cartegraph",
        quality: 100,
        width: 480,
        height: 640};
      var that = this;

      ImageResizer.resize(options,
        function(image) {
          that.upload(image);
          // success: image is the new resized image
        }, function() {
          console.log('boo');
          // failed: grumpy cat likes this function
        });
    }
}
