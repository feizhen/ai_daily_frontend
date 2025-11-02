import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../utils/token';

export const Callback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');

    if (token && refresh) {
      // 保存tokens
      tokenManager.setTokens(token, refresh);
      // 跳转到首页
      navigate('/', { replace: true });
    } else {
      // 如果没有token,跳转到登录页
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <p>正在处理登录...</p>
    </div>
  );
};

