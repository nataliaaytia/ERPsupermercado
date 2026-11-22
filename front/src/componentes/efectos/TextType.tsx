import { useEffect, useState } from 'react';
import './TextType.css';

interface Props {
  text: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorCharacter?: string;
}

/** Texto que se escribe y borra solo, recorriendo varias frases. */
export default function TextType({
  text,
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseDuration = 1800,
  loop = true,
  showCursor = true,
  cursorCharacter = '|',
}: Props) {
  const [indiceFrase, setIndiceFrase] = useState(0);
  const [visible, setVisible] = useState('');
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    const frase = text[indiceFrase] ?? '';
    const esUltima = indiceFrase === text.length - 1;

    let espera = borrando ? deletingSpeed : typingSpeed;
    let siguiente: () => void;

    if (!borrando && visible === frase) {
      if (esUltima && !loop) return;
      espera = pauseDuration;
      siguiente = () => setBorrando(true);
    } else if (borrando && visible === '') {
      siguiente = () => {
        setBorrando(false);
        setIndiceFrase((actual) => (actual + 1) % text.length);
      };
    } else {
      siguiente = () =>
        setVisible((actual) => (borrando ? actual.slice(0, -1) : frase.slice(0, actual.length + 1)));
    }

    const temporizador = window.setTimeout(siguiente, espera);
    return () => window.clearTimeout(temporizador);
  }, [text, indiceFrase, visible, borrando, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <span className="text-type" aria-label={text[indiceFrase]}>
      <span aria-hidden="true">{visible}</span>
      {showCursor && (
        <span className="text-type__cursor" aria-hidden="true">
          {cursorCharacter}
        </span>
      )}
    </span>
  );
}
