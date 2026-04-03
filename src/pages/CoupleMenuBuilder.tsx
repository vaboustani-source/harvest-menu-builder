import { useState, useCallback } from 'react';
import { useBuilderState } from '@/hooks/useBuilderState';
import { BuilderSelections, STEPS, defaultSelections } from '@/data/builderMenuData';
import { CoupleLogin } from '@/components/builder/CoupleLogin';
import { ProgressStepper } from '@/components/builder/ProgressStepper';
import { BuilderSidebar, MobileTotalBar } from '@/components/builder/BuilderSidebar';
import { StepRehearsalDinner } from '@/components/builder/StepRehearsalDinner';
import { StepWelcomeHour } from '@/components/builder/StepWelcomeHour';
import { StepCocktailHour } from '@/components/builder/StepCocktailHour';
import { StepReceptionDinner } from '@/components/builder/StepReceptionDinner';
import { StepMealInclusions } from '@/components/builder/StepMealInclusions';
import { StepDesserts } from '@/components/builder/StepDesserts';
import { StepBarPackage } from '@/components/builder/StepBarPackage';
import { StepReview } from '@/components/builder/StepReview';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { STEPS as STEP_LIST } from '@/data/builderMenuData';

export default function CoupleMenuBuilder() {
  const {
    profile, selections, setSelections, status,
    loading, saving, lastSavedAt, saveSelections, submitSelections, logout,
  } = useBuilderState();
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = useCallback((updates: Partial<BuilderSelections>) => {
    setSelections(prev => ({ ...prev, ...updates }));
  }, [setSelections]);

  const goToStep = async (step: number) => {
    await saveSelections(selections);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    await submitSelections();
    toast.success("Your menu is in. Brandon will be in touch.");
  };

  const handleSaveDraft = async () => {
    await saveSelections(selections);
    toast.success("Selections saved.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F4' }}>
        <p className="font-sans text-xs uppercase tracking-widest animate-pulse" style={{ color: '#6B6B6B' }}>Loading your menu…</p>
      </div>
    );
  }

  if (!profile) {
    return <CoupleLogin onLogin={() => window.location.reload()} />;
  }

  const isReview = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const stepComponents = [
    <StepRehearsalDinner key="rehearsal" selections={selections} onChange={handleChange} />,
    <StepWelcomeHour key="welcome" selections={selections} onChange={handleChange} />,
    <StepCocktailHour key="cocktail" selections={selections} onChange={handleChange} />,
    <StepReceptionDinner key="reception" selections={selections} onChange={handleChange} />,
    <StepMealInclusions key="inclusions" selections={selections} onChange={handleChange} />,
    <StepDesserts key="desserts" selections={selections} onChange={handleChange} />,
    <StepBarPackage key="bar" selections={selections} onChange={handleChange} />,
    <StepReview key="review" selections={selections} guestCount={profile.guest_count}
      status={status} saving={saving} onSaveDraft={handleSaveDraft} onSubmit={handleSubmit} />,
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F4' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between"
        style={{ background: '#2C3E2D', boxShadow: '0 2px 12px rgba(44,62,45,0.15)' }}>
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(250,248,244,0.5)' }}>
            Harvest 336 · Menu Builder
          </p>
          <h1 className="font-serif italic text-lg leading-none" style={{ color: '#FAF8F4' }}>
            {profile.partner1_name} & {profile.partner2_name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {profile.wedding_date && (
            <span className="font-sans text-[11px] hidden sm:block" style={{ color: 'rgba(250,248,244,0.5)' }}>
              {new Date(profile.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          <Button variant="ghost" onClick={logout}
            className="text-[#FAF8F4] hover:text-[#FAF8F4]/80 hover:bg-white/10 font-sans text-xs uppercase tracking-widest px-3 gap-1.5">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </header>

      {/* Stepper */}
      <ProgressStepper current={currentStep} onChange={goToStep} />

      {/* Content + Sidebar */}
      <div className="max-w-[1200px] mx-auto flex">
        <main className="flex-1 px-6 pt-8 pb-32 lg:pb-16">
          {/* Saved indicator */}
          {lastSavedAt && !saving && (
            <div className="flex items-center gap-1.5 mb-4">
              <Check size={12} style={{ color: '#7A9E7E' }} />
              <span className="font-serif italic text-[12px]" style={{ color: '#7A9E7E' }}>Saved</span>
            </div>
          )}
          {saving && (
            <div className="mb-4">
              <span className="font-serif italic text-[12px]" style={{ color: '#C9A84C' }}>Saving…</span>
            </div>
          )}
          {stepComponents[currentStep]}

          {/* Navigation */}
          {!isReview && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t" style={{ borderColor: '#E8E2D9' }}>
              {!isFirst ? (
                <Button variant="outline" onClick={() => goToStep(currentStep - 1)}
                  className="font-sans text-xs tracking-[0.15em] uppercase border-[#E8E2D9] gap-1.5">
                  <ChevronLeft size={14} /> Back
                </Button>
              ) : <div />}
              <Button onClick={() => goToStep(currentStep + 1)} disabled={saving}
                className="font-sans text-xs tracking-[0.15em] uppercase gap-1.5"
                style={{ background: '#2C3E2D', color: '#FAF8F4' }}>
                {saving ? 'Saving…' : 'Save & Continue'} <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </main>

        <BuilderSidebar selections={selections} guestCount={profile.guest_count} />
      </div>

      <MobileTotalBar selections={selections} />
    </div>
  );
}
