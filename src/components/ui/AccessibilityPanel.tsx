import { type ReactNode } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Modal, Button } from '@/components/ui/Card';
import { Type, Eye, Volume2, Hand, RotateCcw, Palette, Ruler, AlignLeft } from 'lucide-react';

interface ToggleRowProps {
  label: string;
  description: string;
  icon: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, icon, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-nest-blue-50 flex items-center justify-center text-nest-blue-500">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-700">{label}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 rounded-full transition-colors ${checked ? 'bg-nest-blue-400' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${checked ? 'left-7' : 'left-1'}`}
        />
      </button>
    </div>
  );
}

interface SelectRowProps {
  label: string;
  icon: ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function SelectRow({ label, icon, value, options, onChange }: SelectRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-nest-lavender-50 flex items-center justify-center text-nest-lavender-500">
          {icon}
        </div>
        <p className="font-semibold text-gray-700">{label}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 font-medium text-gray-700 bg-white cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface AccessibilityPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({ open, onClose }: AccessibilityPanelProps) {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  return (
    <Modal open={open} onClose={onClose} title="Accessibility Settings" className="max-w-xl">
      <div className="space-y-1">
        <ToggleRow
          label="Dyslexia-Friendly Font"
          description="Use a special font that's easier to read"
          icon={<Type className="w-5 h-5" />}
          checked={settings.dyslexiaFont}
          onChange={(v) => updateSetting('dyslexiaFont', v)}
        />
        <SelectRow
          label="Font Size"
          icon={<Type className="w-5 h-5" />}
          value={settings.fontSize}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'x-large', label: 'Extra Large' },
          ]}
          onChange={(v) => updateSetting('fontSize', v as typeof settings.fontSize)}
        />
        <SelectRow
          label="Line Spacing"
          icon={<AlignLeft className="w-5 h-5" />}
          value={settings.lineSpacing}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'relaxed', label: 'Relaxed' },
            { value: 'wide', label: 'Wide' },
          ]}
          onChange={(v) => updateSetting('lineSpacing', v as typeof settings.lineSpacing)}
        />
        <SelectRow
          label="Word Spacing"
          icon={<AlignLeft className="w-5 h-5" />}
          value={settings.wordSpacing}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'wide', label: 'Wide' },
          ]}
          onChange={(v) => updateSetting('wordSpacing', v as typeof settings.wordSpacing)}
        />
        <ToggleRow
          label="Reading Ruler"
          description="A highlight bar follows your mouse to help you read"
          icon={<Ruler className="w-5 h-5" />}
          checked={settings.readingRuler}
          onChange={(v) => updateSetting('readingRuler', v)}
        />
        <ToggleRow
          label="High Contrast Mode"
          description="Make text and colors stand out more"
          icon={<Eye className="w-5 h-5" />}
          checked={settings.highContrast}
          onChange={(v) => updateSetting('highContrast', v)}
        />
        <SelectRow
          label="Color Theme"
          icon={<Palette className="w-5 h-5" />}
          value={settings.colorTheme}
          options={[
            { value: 'default', label: 'Default (Mixed Pastel)' },
            { value: 'blue', label: 'Calm Blue' },
            { value: 'green', label: 'Fresh Green' },
            { value: 'warm', label: 'Warm Peach' },
            { value: 'high-contrast', label: 'High Contrast' },
          ]}
          onChange={(v) => updateSetting('colorTheme', v as typeof settings.colorTheme)}
        />
        <ToggleRow
          label="Text-to-Speech"
          description="Read text out loud with a friendly voice"
          icon={<Volume2 className="w-5 h-5" />}
          checked={settings.textToSpeech}
          onChange={(v) => updateSetting('textToSpeech', v)}
        />
        <ToggleRow
          label="Large Buttons & Icons"
          description="Make everything bigger and easier to tap"
          icon={<Hand className="w-5 h-5" />}
          checked={settings.largeButtons}
          onChange={(v) => updateSetting('largeButtons', v)}
        />
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={resetSettings} icon={<RotateCcw className="w-4 h-4" />}>
          Reset to Default
        </Button>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}
