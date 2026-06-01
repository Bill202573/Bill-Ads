import { supabase } from './supabase-service';
import { MetaAdsService } from './meta-ads-service';
import { GoogleAdsService } from './google-ads-service';

export class SyncService {
  /**
   * Sync campaigns for all integrations
   */
  static async syncAllCampaigns() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all integrations for this user
      const { data: integrations } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);

      if (!integrations || integrations.length === 0) {
        return { success: true, message: 'No integrations found' };
      }

      let totalCampaigns = 0;

      // Sync each integration
      for (const integration of integrations) {
        if (integration.platform === 'meta') {
          const metaService = new MetaAdsService(integration.access_token);

          // Get campaigns from Meta
          const campaignsResult = await metaService.getCampaigns(integration.platform_account_id);

          if (campaignsResult.success && campaignsResult.data) {
            // Save campaigns to database
            for (const campaign of campaignsResult.data) {
              await supabase.from('campaigns').upsert({
                user_id: user.id,
                integration_id: integration.id,
                platform: 'meta',
                campaign_id: campaign.id,
                campaign_name: campaign.name,
                status: campaign.status,
                objective: campaign.objective,
                daily_budget: campaign.daily_budget,
                synced_at: new Date().toISOString(),
              }, {
                onConflict: 'platform,campaign_id'
              });

              totalCampaigns++;
            }
          }

          // Update integration last_sync
          await supabase
            .from('integrations')
            .update({ last_sync: new Date().toISOString() })
            .eq('id', integration.id);
        }
      }

      return {
        success: true,
        message: `Synced ${totalCampaigns} campaigns`
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Sync campaigns for a specific integration
   */
  static async syncIntegrationCampaigns(integrationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .eq('user_id', user.id)
        .single();

      if (!integration) throw new Error('Integration not found');

      if (integration.platform === 'meta') {
        const metaService = new MetaAdsService(integration.access_token);
        const campaignsResult = await metaService.getCampaigns(integration.platform_account_id);

        if (!campaignsResult.success) {
          throw new Error(campaignsResult.error);
        }

        let count = 0;
        for (const campaign of campaignsResult.data || []) {
          await supabase.from('campaigns').upsert({
            user_id: user.id,
            integration_id: integration.id,
            platform: 'meta',
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            daily_budget: campaign.daily_budget,
            synced_at: new Date().toISOString(),
          }, {
            onConflict: 'platform,campaign_id'
          });
          count++;
        }

        // Update integration
        await supabase
          .from('integrations')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', integrationId);

        return { success: true, message: `Synced ${count} campaigns` };
      }

      return { success: false, error: 'Platform not supported' };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: String(error) };
    }
  }
}
