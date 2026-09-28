import { useState, type FormEvent } from 'react';
import { apiRegisterAdmin } from '../ts/apiCalls/Admin';

interface CreateAdminFormProps {
  onCreated: () => void;
}

export default function CreateAdminForm({ onCreated }: CreateAdminFormProps) {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await apiRegisterAdmin(email, userName, password);
      setEmail('');
      setUserName('');
      setPassword('');
      onCreated();
    } catch {
      setError('Could not create admin. Check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="createAdminForm" onSubmit={handleSubmit}>
      <div className="createAdminHeader">
        <h2 id="create-admin-title">Create admin</h2>
        <p>Add an administrator to your workspace.</p>
      </div>
      <div className="createAdminField">
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} autoFocus required />
      </div>
      <div className="createAdminField">
        <label htmlFor="admin-username">Username</label>
        <input id="admin-username" autoComplete="off" value={userName} onChange={event => setUserName(event.target.value)} required />
      </div>
      <div className="createAdminField">
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required />
      </div>
      {error && <p className="errorText" role="alert">{error}</p>}
      <button className="createAdminSubmit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create admin'}
      </button>
    </form>
  );
}
