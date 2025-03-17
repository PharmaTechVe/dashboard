'use client';
import React, { useState } from 'react';

type StepperProps = {
  steps: string[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  borderColor?: string;
  backgroundColor?: string;
  labelColor?: string;
  stepSize?: number;
  lineColor?: string;
  lineSize?: number;
  marginBottom?: number; // Si se modifica stepSize se debe modificar marginBottom
};

const Stepper: React.FC<StepperProps> = ({
  steps,
  initialStep,
  onStepChange,
  borderColor,
  backgroundColor,
  labelColor,
  stepSize,
  lineColor,
  lineSize,
  marginBottom,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);

  return (
    <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-md">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {index !== 0 && (
            <div
              style={{
                backgroundColor: index <= currentStep ? borderColor : lineColor,
                width: `${lineSize}px`,
                height: '2px',
                marginBottom: `${marginBottom}px`,
                marginTop: `${(stepSize ?? 40) / 2 - 1}px`,
              }}
            ></div>
          )}
          <div
            className="flex cursor-pointer flex-col items-center"
            onClick={() => {
              setCurrentStep(index);
              if (onStepChange) onStepChange(index);
            }}
          >
            <div
              className="flex items-center justify-center rounded-full border"
              style={{
                width: stepSize ?? 40,
                height: stepSize ?? 40,
                backgroundColor:
                  index === currentStep ? borderColor : backgroundColor,
                borderColor: borderColor,
                color: index === currentStep ? backgroundColor : borderColor,
                fontWeight: 'bold',
              }}
            >
              {index + 1}
            </div>
            <span className="mt-2 text-sm" style={{ color: labelColor }}>
              {step}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
