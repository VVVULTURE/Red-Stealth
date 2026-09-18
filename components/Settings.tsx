'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff, ExternalLink, Shield, Check, X, Zap, RotateCcw } from 'lucide-react';
import { WEB_PROVIDERS as PROVIDERS, getProvider, testApiKey } from '@/lib/providers';
import { getApiKeys, setApiKeys, clearApiKeys } from '@/lib/storage';
import { ModelProvider } from '@/lib/types';

interface SettingsProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function Settings({ showToast }: SettingsProps) {
  const [keys, setKeys] = useState<Record<string, string | undefined>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [selectedProvider, setSelectedProvider] = useState<string>('rudra-free');
  const [testing, setTesting] = useState<string | null>(null);
  const [testAllStatus, setTestAllStatus] = useState<Record<string, 'valid' | 'invalid' | 'testing'>>({});

  useEffect(() => { setKeys(getApiKeys()); }, []);

  const handleSave = (id: string, key: string) => {
    // Trim whitespace and validate the key is not empty
    const trimmedKey = key?.trim();
    if (!trimmedKey) {
      showToast('warning', 'API key cannot be empty');
      return;
    }
    
    const newKeys = { ...keys, [id]: trimmedKey };
    setKeys(newKeys);
    setApiKeys(newKeys);
    showToast('success', `${getProvider(id as any)?.name || id} API key saved!`);
  };

  const handleClearAll = () => { setKeys({}); clearApiKeys(); showToast('info', 'All API keys cleared'); };

  const handleTest = async (id: string) => {
    const key = keys[id];
    if (!key || !key.trim()) { 
      showToast('warning', 'No API key to test'); 
      return; 
    }
    setTesting(id);
    showToast('info', `Testing ${id}...`);
    try {
      const valid = await testApiKey(id as any, key.trim());
      setTesting(null);
      if (valid) {
        showToast('success', `${id} key is valid! ✅`);
      } else {
        showToast('error', `${id} key is invalid. Please check your API key and try again. ❌`);
      }
    } catch (err: any) {
      setTesting(null);
      showToast('error', `Error testing key: ${err.message || 'Unknown error'}`);
    }
  };

  const current = getProvider(selectedProvider as any);

  const handleTestAll = async () => {
    const entries = Object.entries(keys).filter(([_, v]) => v && v.trim().length > 0);
    if (entries.length === 0) { showToast('warning', 'No keys to test'); return; }
    const status: Record<string, 'valid' | 'invalid' | 'testing'> = {};
    entries.forEach(([id]) => { status[id] = 'testing'; });
    setTestAllStatus(status);
    let validCount = 0;
    await Promise.all(entries.map(async ([id, key]) => {
      try {
        const ok = await testApiKey(id as ModelProvider, key!);
        setTestAllStatus(prev => ({ ...prev, [id]: ok ? 'valid' : 'invalid' }));
        if (ok) validCount++;
      } catch {
        setTestAllStatus(prev => ({ ...prev, [id]: 'invalid' }));
      }
    }));
    showToast('success', `${validCount}/${entries.length} key(s) valid`);
  };

  const freeProviders = PROVIDERS.filter(p => p.free);
  const paidProviders = PROVIDERS.filter(p => !p.free);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent-400" /> Settings
        </h2>
        <p className="text-dark-400 mt-1">Choose a provider. The built-in free model does not require an API key.</p>
      </div>

      <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-dark-200">Your API keys are stored <strong>only in your browser&apos;s localStorage</strong>.</p>
          <p className="text-xs text-dark-400 mt-1">They never leave your device. Text goes directly to the AI provider you choose.</p>
        </div>
      </div>

      {/* Free Providers */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-400" /> Free Providers
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">No cost</span>
        </h3>
        <div className="grid gap-3">
          {freeProviders.map(provider => (
            <div key={provider.id} onClick={() => setSelectedProvider(provider.id)}
              className={`bg-dark-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                selectedProvider === provider.id ? 'border-accent-500/50 bg-accent-500/5' : 'border-dark-700/50 hover:border-dark-600'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{provider.name}</h4>
                    {keys[provider.id] && <Check className="w-4 h-4 text-green-400" />}
                    {testAllStatus[provider.id] === 'valid' && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">Valid</span>}
                    {testAllStatus[provider.id] === 'invalid' && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">Invalid</span>}
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">FREE</span>
                  </div>
                  <p className="text-sm text-dark-400 mt-1">{provider.description}</p>
                </div>
                <Eye className="w-4 h-4 text-dark-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Providers */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Paid Providers</h3>
        <div className="grid gap-3">
          {paidProviders.map(provider => (
            <div key={provider.id} onClick={() => setSelectedProvider(provider.id)}
              className={`bg-dark-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                selectedProvider === provider.id ? 'border-accent-500/50 bg-accent-500/5' : 'border-dark-700/50 hover:border-dark-600'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{provider.name}</h4>
                    {keys[provider.id] && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                  <p className="text-sm text-dark-400 mt-1">{provider.description}</p>
                </div>
                <Eye className="w-4 h-4 text-dark-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Provider Config */}
      {current && (
        <div className="bg-dark-800/50 border border-accent-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">{current.name}</h3>
              <p className="text-sm text-dark-400">{current.description}</p>
            </div>
            {current.free && <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">Free</span>}
          </div>

          <div>
            {current.id === 'rudra-free' ? (
              <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-300">Pre-configured · No API key needed</div>
                  <p className="text-xs text-dark-400 mt-1">
                    The maintainer hosts this model on a free Oracle Cloud ARM VPS and exposes it
                    via the StealthHumanizer server. Just close this dialog, paste your text, and
                    click Humanize. Available on the public Vercel deployment by default.
                  </p>
                  <p className="text-xs text-dark-500 mt-2">
                    Self-hosters: set <code className="text-dark-300">RUDRA_HUMANIZER_API_KEY</code> on
                    your Vercel/Node server. See <code className="text-dark-300">.env.example</code>.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-dark-300 mb-2">API Key</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input type={showKeys[current.id] ? 'text' : 'password'}
                      value={keys[current.id] || ''}
                      onChange={e => setKeys(prev => ({ ...prev, [current.id]: e.target.value }))}
                      placeholder={current.placeholder}
                      className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 pr-10" />
                    <button onClick={() => setShowKeys(prev => ({ ...prev, [current.id]: !prev[current.id] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                      {showKeys[current.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button onClick={() => handleSave(current.id, keys[current.id] || '')}
                    className="px-4 py-3 rounded-lg bg-accent-500 text-white font-medium hover:bg-accent-600 transition-colors">
                    Save
                  </button>
                </div>
              </>
            )}
          </div>

          {current.id !== 'rudra-free' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleTest(current.id)} disabled={testing === current.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm disabled:opacity-50">
                {testing === current.id ? <div className="w-4 h-4 border-2 border-dark-400 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                {testing === current.id ? 'Testing...' : 'Test Key'}
              </button>
              {current.getApiKeyUrl && (
                <a href={current.getApiKeyUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm">
                  <ExternalLink className="w-4 h-4" /> Get API Key
                </a>
              )}
              {current.docsUrl && (
                <a href={current.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm">
                  <ExternalLink className="w-4 h-4" /> Docs
                </a>
              )}
            </div>
          )}

          {/* Model selector */}
          {current.models.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Model</label>
              <div className="flex flex-wrap gap-2">
                {current.models.map(m => (
                  <span key={m} className="px-3 py-1 rounded-lg bg-dark-700/50 text-dark-300 text-xs">{m}</span>
                ))}
              </div>
              <p className="text-xs text-dark-500 mt-1">Default: {current.defaultModel}</p>
            </div>
          )}




        </div>
      )}

      {/* Danger Zone */}
      <div className="border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-dark-400 mb-3">Remove all API keys from this browser.</p>
        <button onClick={handleClearAll} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium">Clear All API Keys</button>
      </div>
    </div>
  );
}
