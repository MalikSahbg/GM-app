import React, { useState } from 'react';
import { Building2, Camera, Mail, Phone, Save, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AccountView: React.FC = () => {
  const { currentUser, settings, updateProfile, updateSettings } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [businessPhone, setBusinessPhone] = useState(settings.phone || '');
  const [businessEmail, setBusinessEmail] = useState(settings.email || '');
  const [address, setAddress] = useState(settings.address || '');
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || '');
  const [saved, setSaved] = useState(false);

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile({ name: name.trim(), phone: phone.trim(), profileImage });
    updateSettings({ businessName: businessName.trim(), phone: businessPhone.trim(), email: businessEmail.trim(), address: address.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const uploadPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      window.alert('Choose an image smaller than 3 MB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-5 pb-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Account &amp; Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal profile and business contact details on this device.</p>
      </header>
      <form onSubmit={saveProfile} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-5 sm:flex-row">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-emerald-700">
            {profileImage ? <img src={profileImage} alt="Profile" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}
          </div>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Camera className="h-4 w-4" /> Update profile image
            <input type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">Name<input value={name} onChange={(e) => setName(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 px-3" required /></label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">Email / account<input value={currentUser?.email || ''} readOnly className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-500" /><span className="flex items-center gap-1 text-xs text-slate-400"><Mail className="h-3.5 w-3.5" /> Account email is read-only</span></label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">Contact phone<span className="relative"><Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={phone} onChange={(e) => setPhone(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3" /></span></label>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Building2 className="h-4 w-4 text-emerald-700" />Business identity &amp; contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Business name<input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Business phone<input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Business email<input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Business address<textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" /></label>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:translate-y-px"><Save className="h-4 w-4" />Save profile</button>
          {saved && <span role="status" className="text-sm font-medium text-emerald-700">Profile saved on this device.</span>}
        </div>
      </form>
    </section>
  );
};
