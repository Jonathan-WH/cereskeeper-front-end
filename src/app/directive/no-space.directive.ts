import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNoSpace]'
})
export class NoSpaceDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  // Bloque la touche espace lors de la frappe
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  // Intercepte le collage et retire les espaces
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (clipboardData) {
      // Récupère le texte collé et retire les espaces
      const pastedText = clipboardData.getData('text').replace(/\s+/g, '');
      // Insère le texte filtré à la position du curseur dans le champ
      const inputElement = this.el.nativeElement;
      const start = inputElement.selectionStart || 0;
      const end = inputElement.selectionEnd || 0;
      const currentValue = inputElement.value;
      inputElement.value = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
      // Optionnel : Vous pouvez déclencher un événement input si nécessaire
      const eventInput = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(eventInput);
    }
  }
}