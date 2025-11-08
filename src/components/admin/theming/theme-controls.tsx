
'use client';

import * as React from 'react';
import type { WidgetTheme } from '@/app/admin/theming/page';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface ThemeControlsProps {
  theme: WidgetTheme;
  updateTheme: (newValues: Partial<WidgetTheme>) => void;
}

export function ThemeControls({ theme, updateTheme }: ThemeControlsProps) {
  const handleColorChange =
    (key: keyof WidgetTheme) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateTheme({ [key]: e.target.value });
    };

  const handleValueChange =
    (key: keyof WidgetTheme) => (value: string | number | boolean) => {
      updateTheme({ [key]: value });
    };
  
  const handleSliderChange = 
    (key: keyof WidgetTheme) => (value: number[]) => {
      updateTheme({ [key]: value[0] });
    };

  return (
    <ScrollArea className="h-full bg-background">
      <div className="p-4">
        <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
          {/* 1. Branding */}
          <AccordionItem value="item-1">
            <AccordionTrigger>Branding</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Upload</Label>
                <Input type="file" />
              </div>
              <div className="space-y-2">
                <Label>Header Title</Label>
                <Input
                  value={theme.headerTitle}
                  onChange={(e) =>
                    updateTheme({ headerTitle: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={theme.fontFamily}
                  onValueChange={handleValueChange('fontFamily')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label>Font Size: {theme.fontSize}px</Label>
                <Slider
                  value={[theme.fontSize]}
                  onValueChange={handleSliderChange('fontSize')}
                  min={12}
                  max={20}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar Style</Label>
                <Select
                  value={theme.avatarStyle}
                  onValueChange={handleValueChange('avatarStyle')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Colors */}
          <AccordionItem value="item-2">
            <AccordionTrigger>Colors</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Primary Color</Label>
                <Input
                  type="color"
                  className="w-12 h-8"
                  value={theme.primaryColor}
                  onChange={handleColorChange('primaryColor')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Secondary Color</Label>
                <Input
                  type="color"
                  className="w-12 h-8"
                  value={theme.secondaryColor}
                  onChange={handleColorChange('secondaryColor')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Accent Color</Label>
                <Input
                  type="color"
                  className="w-12 h-8"
                  value={theme.accentColor}
                  onChange={handleColorChange('accentColor')}
                />
              </div>
               <Separator />
               <div className="space-y-2">
                 <Label>Color Mode</Label>
                <Select
                  value={theme.colorMode}
                  onValueChange={handleValueChange('colorMode')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Bubble Animation */}
          <AccordionItem value="item-3">
            <AccordionTrigger>Bubble Animation</AccordionTrigger>
            <AccordionContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Idle Pulse</Label>
                    <Switch checked={theme.idlePulse} onCheckedChange={handleValueChange('idlePulse')} />
                </div>
                 <div className="flex items-center justify-between">
                    <Label>Hover Ripple</Label>
                    <Switch checked={theme.hoverRipple} onCheckedChange={handleValueChange('hoverRipple')} />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Icon Spin on Hover</Label>
                    <Switch checked={theme.iconSpinOnHover} onCheckedChange={handleValueChange('iconSpinOnHover')} />
                </div>
                <div className="space-y-2">
                    <Label>Bubble Size</Label>
                    <Select value={theme.bubbleSize} onValueChange={handleValueChange('bubbleSize')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={theme.bubblePosition} onValueChange={handleValueChange('bubblePosition')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* 4. Open/Close Animation */}
           <AccordionItem value="item-4">
            <AccordionTrigger>Open & Close Animation</AccordionTrigger>
            <AccordionContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Open Animation</Label>
                    <Select value={theme.openAnimation} onValueChange={handleValueChange('openAnimation')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scale-fade">Scale + Fade</SelectItem>
                        <SelectItem value="particle-burst">Particle Burst</SelectItem>
                        <SelectItem value="slide-up">Slide-up</SelectItem>
                        <SelectItem value="flip-open">Flip Open</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Close Animation</Label>
                    <Select value={theme.closeAnimation} onValueChange={handleValueChange('closeAnimation')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shrink">Shrink to bubble</SelectItem>
                        <SelectItem value="paper-plane">Paper plane fold</SelectItem>
                        <SelectItem value="drop-bounce">Drop + Bounce</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center justify-between">
                    <Label>Wink Bubble after Close</Label>
                    <Switch checked={theme.winkAfterClose} onCheckedChange={handleValueChange('winkAfterClose')} />
                </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Message Animations */}
           <AccordionItem value="item-5">
            <AccordionTrigger>Message Animations</AccordionTrigger>
            <AccordionContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Message Entry Style</Label>
                    <Select value={theme.messageEntryStyle} onValueChange={handleValueChange('messageEntryStyle')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bounce">Bounce</SelectItem>
                        <SelectItem value="slide-in">Slide-in</SelectItem>
                        <SelectItem value="liquid-shimmer">Liquid Shimmer</SelectItem>
                         <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Typing Indicator Style</Label>
                    <Select value={theme.typingIndicatorStyle} onValueChange={handleValueChange('typingIndicatorStyle')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dots">Classic Dots</SelectItem>
                        <SelectItem value="waveform">Waveform Bars</SelectItem>
                        <SelectItem value="orbiting">Orbiting Icons</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* 6. Widget Shape & Layout */}
          <AccordionItem value="item-6">
            <AccordionTrigger>Widget Shape & Layout</AccordionTrigger>
            <AccordionContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Rounded Corners: {theme.roundedCorners}px</Label>
                    <Slider value={[theme.roundedCorners]} onValueChange={handleSliderChange('roundedCorners')} min={0} max={32} step={1}/>
                </div>
                 <div className="space-y-2">
                    <Label>Shadow Intensity: {theme.shadowIntensity}%</Label>
                    <Slider value={[theme.shadowIntensity]} onValueChange={handleSliderChange('shadowIntensity')} min={0} max={100} step={5}/>
                </div>
                <div className="space-y-2">
                    <Label>Border Thickness: {theme.borderThickness}px</Label>
                    <Slider value={[theme.borderThickness]} onValueChange={handleSliderChange('borderThickness')} min={0} max={5} step={1}/>
                </div>
                 <div className="flex items-center justify-between">
                    <Label>Border Color</Label>
                    <Input type="color" className="w-12 h-8" value={theme.borderColor} onChange={handleColorChange('borderColor')} />
                </div>
                <div className="space-y-2">
                    <Label>Window Size</Label>
                    <Select value={theme.windowSize} onValueChange={handleValueChange('windowSize')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </AccordionContent>
          </AccordionItem>
          
           {/* 7. Sound & Haptics */}
          <AccordionItem value="item-7">
            <AccordionTrigger>Sound & Haptics</AccordionTrigger>
            <AccordionContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label>UI Sound Effects</Label>
                    <Switch checked={theme.soundEffects} onCheckedChange={handleValueChange('soundEffects')} />
                </div>
                 <div className="space-y-2">
                    <Label>Volume: {theme.soundVolume}%</Label>
                    <Slider value={[theme.soundVolume]} onValueChange={handleSliderChange('soundVolume')} min={0} max={100} step={5}/>
                </div>
                <div className="space-y-2">
                    <Label>Sound Theme</Label>
                    <Select value={theme.soundTheme} onValueChange={handleValueChange('soundTheme')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soft-pops">Soft Pops</SelectItem>
                        <SelectItem value="arcade-clicks">Arcade Clicks</SelectItem>
                        <SelectItem value="garage">Car/Garage Theme</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center justify-between">
                    <Label>Haptic Feedback (Mobile)</Label>
                    <Switch checked={theme.hapticFeedback} onCheckedChange={handleValueChange('hapticFeedback')} />
                </div>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
         <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Embed Snippet</h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 my-2">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
                <code>{`<script src="..."></script>`}</code>
              </pre>
            </div>
            <Button className="w-full">Copy to Clipboard</Button>
        </div>
      </div>
    </ScrollArea>
  );
}
