import { Component, ViewChild, ElementRef } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-check-plant',
  templateUrl: './check-plant.component.html',
  styleUrls: ['./check-plant.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})

export class CheckPlantComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  previewImages: string[] = [];  // ✅ Stocke plusieurs images
  uploadedImageUrls: string[] = [];  // ✅ Stocke les URLs des images uploadées
  analysisResult: string | null = null;
  plantDetails = {
    name: '',
    watering: '',
    conditions: ''
  };
  isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private authService: AuthService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  
  }

  async uploadImageFile(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      } else {
        throw new Error('File is null');
      }
  
      const response = await firstValueFrom(
        this.http.post<any>('http://127.0.0.1:5000/upload-image', formData)
      );
  
      console.log('✅ Image uploaded:', response);
      return response.image_url || null;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      return null;
    }
  }

  // 📸 Capture depuis la caméra
  async captureImage() {
    if (this.previewImages.length >= 3) {
      this.showToast('Maximum 3 images allowed!', 'warning');
      return;
    }
  
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,  // 📸 Capture une image sous forme d'URI (fichier brut)
        source: CameraSource.Camera
      });
  
      if (image.webPath) {
        // ✅ Affiche un aperçu de l'image
        this.previewImages.push(image.webPath);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  // 🖼️ Upload depuis la galerie
  selectImage() {
    if (this.previewImages.length >= 3) {
      this.showToast('Maximum 3 images allowed!', 'warning');
      return;
    }
    this.fileInput.nativeElement.click();
  }

  // 📂 Gestion de l'upload de fichier
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.previewImages.length < 3) {  // ✅ Limiter à 3 images
          this.previewImages.push(reader.result as string);
        } else {
          console.warn('⚠️ Maximum of 3 images allowed');
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

// 🔍 Analyse de la plante avec plusieurs images
async analyzePlant() {
  if (this.previewImages.length === 0) return;

  try {
    const uploadedImageUrls: string[] = [];

    // 📤 Uploader toutes les images avant l'analyse
    for (const previewImage of this.previewImages) {
      let file: File | null = null;

      // ✅ Si c'est une Data URL, convertir en fichier
      if (previewImage.startsWith('data:image/')) {
        file = this.dataUrlToFile(previewImage, `plant_${Date.now()}_${Math.random()}.jpg`);
      } else if (previewImage.startsWith('blob:')) {
        // ✅ Si c'est un Blob URL, récupérer le Blob et créer un fichier
        const response = await fetch(previewImage);
        const blob = await response.blob();
        file = new File([blob], `plant_${Date.now()}_${Math.random()}.jpg`, { type: 'image/jpeg' });
      }

      // 📤 Uploader l'image seulement si elle a été convertie en fichier
      if (file) {
        const uploadedUrl = await this.uploadImageFile(file);
        if (uploadedUrl) {
          uploadedImageUrls.push(uploadedUrl);
        } else {
          console.warn(`❌ Upload failed for file: ${file.name}`);
        }
      } else {
        console.warn('❌ Invalid file format detected, skipping...');
      }
    }

    if (uploadedImageUrls.length !== this.previewImages.length) {
      throw new Error('Some images failed to upload');
    }

    // 🔥 Préparer la requête pour l'analyse
    const payload = {
      image_urls: uploadedImageUrls,  // ✅ Envoyer toutes les URLs
      plant_name: this.plantDetails.name || 'Unknown',
      plant_context: this.plantDetails.conditions || 'No context provided'
    };

    // 📡 Envoi à Flask
    const response = await firstValueFrom(
      this.http.post<any>('http://127.0.0.1:5000/analyze-plant', payload)
    );

    this.analysisResult = response.analysis;

    // ✅ Toast de succès
    const toast = await this.toastController.create({
      message: 'Analysis complete!',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

  // 🔁 Convertir Data URL en fichier pour FormData
  private dataUrlToFile(dataUrl: string, filename: string): File | null {
    if (!dataUrl.startsWith('data:image/')) {
      console.error('❌ The provided string is not a valid Data URL:', dataUrl);
      return null;  // ⛔ Évite les erreurs pour les URLs Firebase Storage
    }
  
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
  
    if (!mimeMatch) {
      console.error('❌ MIME type could not be extracted:', arr[0]);
      return null;
    }
  
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
  }

  // 🔔 Affichage des notifications
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1);
    this.uploadedImageUrls.splice(index, 1);
    this.showToast('Image removed', 'warning');
}
}