"use client";
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useBusiness } from '../context/TransactionContext';

const UserSync: React.FC = () => {
  const { user } = useUser();
  const { setUserId } = useBusiness();

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user, setUserId]);

  return null;
};

export default UserSync; 