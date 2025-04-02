import { Component, ViewChild, ElementRef } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-check-plant',
  templateUrl: './check-plant.component.html',
  styleUrls: ['./check-plant.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})

export class CheckPlantComponent implements ViewWillEnter {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  previewImages: string[] = [];  // Stocke les aperçus des images
  uploadedImageUrls: string[] = [];  // Stocke les URLs des images envoyées
  analysisResult: SafeHtml | null = null;  // Stocke le HTML analysé en toute sécurité
  plantDetails = { environment: '', variety: '', symptoms: '' };
  isAuthenticated$: Observable<boolean>;
  isLoading = false; // ✅ Indique si l'analyse est en cours
  analysisDone = false; // ✅ Pour masquer tout sauf l'analyse une fois terminée
  showMoreInfo = false; // ✅ Par défaut, la section est cachée


  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private authService: AuthService,
    private sanitizer: DomSanitizer  // Nécessaire pour afficher du HTML Ionic sécurisé
  ) {
    // Initialisation des valeurs par défaut
    this.plantDetails = {
      environment: '',
      variety: '',
      symptoms: ''
    };
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ionViewWillEnter() {
    console.log("🔄 Composant réinitialisé !");
    this.resetComponent();
  }

  resetComponent() {
    this.previewImages = [];
    this.uploadedImageUrls = [];
    this.analysisResult = null;
    this.plantDetails = {
      environment: '',
      variety: '',
      symptoms: ''
    };
    this.isLoading = false;
    this.analysisDone = false;
    this.showMoreInfo = false;
  }

  async analyzePlant() {
    if (this.previewImages.length === 0) {
      this.showToast('Please upload at least one image.', 'warning');
      return;
    }
  
    this.isLoading = true;
  
    try {
      // 🔥 Récupérer l'ID utilisateur Firebase
      const user = await this.authService.getUserData();
      if (!user || !user.uid) {
        throw new Error('User not authenticated');
      }
  
      const uploadedImageUrls: string[] = [];
  
      for (const previewImage of this.previewImages) {
        let file: File | null = null;
  
        if (previewImage.startsWith('data:image/')) {
          file = this.dataUrlToFile(previewImage, `plant_${Date.now()}_${Math.random()}.jpg`);
        } else if (previewImage.startsWith('blob:')) {
          const response = await fetch(previewImage);
          const blob = await response.blob();
          file = new File([blob], `plant_${Date.now()}_${Math.random()}.jpg`, { type: 'image/jpeg' });
        }
  
        if (file) {
          const uploadedUrl = await this.uploadImageFile(file);
          if (uploadedUrl) {
            uploadedImageUrls.push(uploadedUrl);
          }
        }
      }
  
      if (uploadedImageUrls.length !== this.previewImages.length) {
        throw new Error('Some images failed to upload');
      }
  
      // ✅ Ajouter user_id pour stocker correctement l'analyse
      const payload = {
        user_id: user.uid, // 🔥 Ajout de l'UID Firebase
        image_urls: uploadedImageUrls,
        environment: this.plantDetails.environment || 'Not specified',
        variety: this.plantDetails.variety || 'Unknown',
        symptoms: this.plantDetails.symptoms || 'No symptoms reported'
      };
  
      const response = await firstValueFrom(
        this.http.post<any>('http://127.0.0.1:5000/analysis/analyze-plant', payload)
      );
  
      console.log('✅ Analysis response:', response);
  
      let cleanHtml = response.analysis
        .replace(/```html/g, '')
        .replace(/```/g, '')
        .trim();
  
      this.analysisResult = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
      this.analysisDone = true;
    } catch (error) {
      console.error('❌ Error during analysis:', error);
      this.showToast('Analysis failed. Try again.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async uploadImageFile(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await firstValueFrom(
        this.http.post<any>('http://127.0.0.1:5000/image/upload-image', formData)
      );

      console.log('✅ Image uploaded:', response);
      return response.image_url || null;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      return null;
    }
  }

  async captureImage() {
    if (this.previewImages.length >= 3) {
      this.showToast('Maximum 3 images allowed!', 'warning');
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        this.previewImages.push(image.webPath);
      }
    } catch (error) {
      console.error('❌ Error capturing image:', error);
    }
  }

  selectImage() {
    if (this.previewImages.length >= 3) {
      this.showToast('Maximum 3 images allowed!', 'warning');
      return;
    }
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.previewImages.length < 3) {
          this.previewImages.push(reader.result as string);
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1);
    this.uploadedImageUrls.splice(index, 1);
    this.showToast('Image removed', 'warning');
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  private dataUrlToFile(dataUrl: string, filename: string): File | null {
    if (!dataUrl.startsWith('data:image/')) {
      console.error('❌ Invalid Data URL:', dataUrl);
      return null;
    }

    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);

    if (!mimeMatch) {
      console.error('❌ MIME type extraction failed:', arr[0]);
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


  clearSelection() {
    this.plantDetails.environment = '';
  }

  clearTextAera() {
    this.plantDetails.symptoms = '';
  }

  reloadPage() {
    window.location.reload();
  }
}