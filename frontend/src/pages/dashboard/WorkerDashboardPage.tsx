import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { workerService } from '../../modules/worker/worker.service';

interface DashboardStats {
  totalApplications: number;
  selectedJobs: number;
  completedJobs: number;
  totalEarnings: number;
}

export const WorkerDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboard = await workerService.getDashboard();
        setStats(dashboard.stats);
        setRecentApplications(dashboard.recentApplications || []);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-slate-600'>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={t('dashboard.workerTitle')}
        subtitle={t('dashboard.welcome', {
          name: profile?.worker?.name || user?.mobileNumber || '',
        })}
      />

      {error && <div className='rounded bg-red-50 p-3 text-sm text-red-600'>{error}</div>}

      {/* Stats Grid */}
      {stats && (
        <div className='grid grid-cols-2 gap-4'>
          <div className='rounded-panel bg-blue-50 p-4 shadow-panel'>
            <p className='text-xs text-slate-600'>{t('dashboard.applications')}</p>
            <p className='text-2xl font-bold text-blue-600'>{stats.totalApplications}</p>
          </div>
          <div className='rounded-panel bg-green-50 p-4 shadow-panel'>
            <p className='text-xs text-slate-600'>{t('dashboard.selectedJobs')}</p>
            <p className='text-2xl font-bold text-green-600'>{stats.selectedJobs}</p>
          </div>
          <div className='rounded-panel bg-purple-50 p-4 shadow-panel'>
            <p className='text-xs text-slate-600'>{t('dashboard.completedJobs')}</p>
            <p className='text-2xl font-bold text-purple-600'>{stats.completedJobs}</p>
          </div>
          <div className='rounded-panel bg-orange-50 p-4 shadow-panel'>
            <p className='text-xs text-slate-600'>{t('dashboard.earnings')}</p>
            <p className='text-2xl font-bold text-orange-600'>?{stats.totalEarnings}</p>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <Button
        fullWidth
        onClick={() => navigate('/jobs/open')}
        className='bg-blue-600 hover:bg-blue-700'
      >
        {t('dashboard.findWork')}
      </Button>

      {/* Recent Applications */}
      <div className='rounded-panel bg-white p-5 shadow-panel'>
        <h3 className='mb-4 font-semibold text-slate-900'>{t('dashboard.recentApps')}</h3>
        {recentApplications.length === 0 ? (
          <p className='text-center text-slate-500'>{t('dashboard.noApps')}</p>
        ) : (
          <div className='space-y-3'>
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className='flex cursor-pointer items-between justify-between rounded border border-slate-200 p-3 hover:bg-slate-50'
                onClick={() => navigate('/applications/my')}
              >
                <div className='flex-1'>
                  <p className='font-medium text-slate-900'>{app.job.title}</p>
                  <p className='text-xs text-slate-600'>{app.job.category}</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-semibold text-slate-900'>?{app.job.wage}</p>
                  <p className='text-xs text-slate-500'>{app.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className='grid grid-cols-2 gap-3'>
        <Button
          variant='secondary'
          fullWidth
          onClick={() => navigate('/applications/my')}
        >
          My Applications
        </Button>
        <Button
          variant='secondary'
          fullWidth
          onClick={() => navigate('/jobs/assigned')}
        >
          Assigned Jobs
        </Button>
      </div>
    </div>
  );
};
