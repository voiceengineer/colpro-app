import { useState, useRef } from 'react';

export function useVisitState() {
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showJobsheetModal, setShowJobsheetModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [customerContacted, setCustomerContacted] = useState(false);
  const [nextAction, setNextAction] = useState('');
  const [visitStartTime] = useState(new Date());
  const cameraRef = useRef(null);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const retakePicture = () => {
    setCapturedPhoto(null);
  };

  const resetVisitState = () => {
    setCapturedPhoto(null);
    setNotes('');
    setOutcome('');
    setLocation(null);
    setPaymentAmount('');
    setPaymentNotes('');
    setNextAction('');
    setCustomerContacted(false);
  };

  return {
    facing,
    flash,
    capturedPhoto,
    setCapturedPhoto,
    location,
    setLocation,
    notes,
    setNotes,
    outcome,
    setOutcome,
    saving,
    setSaving,
    showPaymentModal,
    setShowPaymentModal,
    showJobsheetModal,
    setShowJobsheetModal,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    paymentNotes,
    setPaymentNotes,
    customerContacted,
    setCustomerContacted,
    nextAction,
    setNextAction,
    visitStartTime,
    cameraRef,
    toggleCameraFacing,
    toggleFlash,
    retakePicture,
    resetVisitState,
  };
}
