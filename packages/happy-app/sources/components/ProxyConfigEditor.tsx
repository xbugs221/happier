import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Pressable, ScrollView, Modal as RNModal } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import { ItemGroup } from '@/components/ItemGroup';
import { Item } from '@/components/Item';
import { Ionicons } from '@expo/vector-icons';

interface ProxyConfig {
    enabled: boolean;
    httpProxy?: string;
    httpsProxy?: string;
    allProxy?: string;
    noProxy?: string;
}

interface ProxyConfigEditorProps {
    initialConfig?: ProxyConfig;
    onSave: (config: ProxyConfig) => Promise<void>;
    onCancel: () => void;
}

function validateProxyUrl(url: string, allowEmpty: boolean = true): string | null {
    if (allowEmpty && !url.trim()) return null;
    if (!url.trim()) return t('proxyConfig.errors.required');

    try {
        const parsed = new URL(url);
        const validSchemes = ['http:', 'https:', 'socks4:', 'socks5:', 'socks:'];
        if (!validSchemes.includes(parsed.protocol)) {
            return t('proxyConfig.errors.invalidScheme');
        }
        if (!parsed.hostname) {
            return t('proxyConfig.errors.missingHostname');
        }
        const port = parsed.port ? parseInt(parsed.port, 10) : null;
        if (port !== null && (port < 1 || port > 65535)) {
            return t('proxyConfig.errors.invalidPort');
        }
        return null;
    } catch {
        return t('proxyConfig.errors.invalidFormat');
    }
}

export function ProxyConfigEditor({ initialConfig, onSave, onCancel }: ProxyConfigEditorProps) {
    const { theme } = useUnistyles();

    const [config, setConfig] = useState<ProxyConfig>(initialConfig ?? {
        enabled: false,
        httpProxy: '',
        httpsProxy: '',
        allProxy: '',
        noProxy: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const validateAll = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (config.enabled) {
            // At least one proxy must be configured when enabled
            if (!config.httpProxy?.trim() && !config.allProxy?.trim()) {
                newErrors.general = t('proxyConfig.errors.atLeastOneProxy');
            }

            if (config.httpProxy) {
                const error = validateProxyUrl(config.httpProxy, false);
                if (error) newErrors.httpProxy = error;
            }

            if (config.httpsProxy) {
                const error = validateProxyUrl(config.httpsProxy, true);
                if (error) newErrors.httpsProxy = error;
            }

            if (config.allProxy) {
                const error = validateProxyUrl(config.allProxy, true);
                if (error) newErrors.allProxy = error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateAll()) return;

        setIsSaving(true);
        try {
            await onSave(config);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <RNModal visible={true} animationType="slide" onRequestClose={onCancel}>
        <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.divider,
            }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, ...Typography.default('semiBold') }}>
                    {t('proxyConfig.title')}
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                <ItemGroup title={t('proxyConfig.generalSettings')}>
                    <Item
                        title={t('proxyConfig.enableProxy')}
                        subtitle={t('proxyConfig.enableProxyDescription')}
                        subtitleLines={0}
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={config.enabled}
                                onValueChange={(enabled) => setConfig({ ...config, enabled })}
                            />
                        }
                    />
                </ItemGroup>

                {config.enabled && (
                    <>
                        <View style={{ backgroundColor: '#FFF3CD', borderRadius: 8, padding: 12, marginHorizontal: 16, marginVertical: 12, flexDirection: 'row' }}>
                            <Ionicons name="warning" size={20} color="#856404" />
                            <Text style={{ flex: 1, fontSize: 14, color: '#856404', marginLeft: 8, ...Typography.default() }}>
                                {t('proxyConfig.securityWarning')}
                            </Text>
                        </View>

                        {errors.general && (
                            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                                <Text style={{ color: '#FF3B30', fontSize: 14, marginTop: 4, ...Typography.default() }}>{errors.general}</Text>
                            </View>
                        )}

                        <ItemGroup title={t('proxyConfig.httpProxySettings')}>
                            <View style={{ padding: 16 }}>
                                <Text style={{ ...Typography.default('semiBold'), fontSize: 14, color: theme.colors.text, marginBottom: 8 }}>
                                    {t('proxyConfig.httpProxy')}
                                </Text>
                                <TextInput
                                    style={{
                                        fontSize: 16,
                                        color: theme.colors.text,
                                        ...Typography.default(),
                                        borderWidth: 1,
                                        borderColor: errors.httpProxy ? '#FF3B30' : theme.colors.divider,
                                        borderRadius: 8,
                                        padding: 12,
                                        backgroundColor: theme.colors.surface,
                                    }}
                                    value={config.httpProxy}
                                    onChangeText={(httpProxy) => {
                                        setConfig({ ...config, httpProxy });
                                        setErrors({ ...errors, httpProxy: '', general: '' });
                                    }}
                                    placeholder={t('proxyConfig.httpProxyPlaceholder')}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="url"
                                />
                                {errors.httpProxy && <Text style={{ color: '#FF3B30', fontSize: 14, marginTop: 4, ...Typography.default() }}>{errors.httpProxy}</Text>}
                            </View>

                            <View style={{ padding: 16, paddingTop: 0 }}>
                                <Text style={{ ...Typography.default('semiBold'), fontSize: 14, color: theme.colors.text, marginBottom: 8 }}>
                                    {t('proxyConfig.httpsProxy')}
                                </Text>
                                <TextInput
                                    style={{
                                        fontSize: 16,
                                        color: theme.colors.text,
                                        ...Typography.default(),
                                        borderWidth: 1,
                                        borderColor: errors.httpsProxy ? '#FF3B30' : theme.colors.divider,
                                        borderRadius: 8,
                                        padding: 12,
                                        backgroundColor: theme.colors.surface,
                                    }}
                                    value={config.httpsProxy}
                                    onChangeText={(httpsProxy) => {
                                        setConfig({ ...config, httpsProxy });
                                        setErrors({ ...errors, httpsProxy: '' });
                                    }}
                                    placeholder={t('proxyConfig.httpsProxyPlaceholder')}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="url"
                                />
                                {errors.httpsProxy && <Text style={{ color: '#FF3B30', fontSize: 14, marginTop: 4, ...Typography.default() }}>{errors.httpsProxy}</Text>}
                            </View>
                        </ItemGroup>

                        <ItemGroup title={t('proxyConfig.advancedSettings')}>
                            <View style={{ padding: 16 }}>
                                <Text style={{ ...Typography.default('semiBold'), fontSize: 14, color: theme.colors.text, marginBottom: 8 }}>
                                    {t('proxyConfig.allProxy')}
                                </Text>
                                <TextInput
                                    style={{
                                        fontSize: 16,
                                        color: theme.colors.text,
                                        ...Typography.default(),
                                        borderWidth: 1,
                                        borderColor: errors.allProxy ? '#FF3B30' : theme.colors.divider,
                                        borderRadius: 8,
                                        padding: 12,
                                        backgroundColor: theme.colors.surface,
                                    }}
                                    value={config.allProxy}
                                    onChangeText={(allProxy) => {
                                        setConfig({ ...config, allProxy });
                                        setErrors({ ...errors, allProxy: '', general: '' });
                                    }}
                                    placeholder={t('proxyConfig.allProxyPlaceholder')}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="url"
                                />
                                {errors.allProxy && <Text style={{ color: '#FF3B30', fontSize: 14, marginTop: 4, ...Typography.default() }}>{errors.allProxy}</Text>}
                            </View>

                            <View style={{ padding: 16, paddingTop: 0 }}>
                                <Text style={{ ...Typography.default('semiBold'), fontSize: 14, color: theme.colors.text, marginBottom: 8 }}>
                                    {t('proxyConfig.noProxy')}
                                </Text>
                                <TextInput
                                    style={{
                                        fontSize: 16,
                                        color: theme.colors.text,
                                        ...Typography.default(),
                                        borderWidth: 1,
                                        borderColor: theme.colors.divider,
                                        borderRadius: 8,
                                        padding: 12,
                                        backgroundColor: theme.colors.surface,
                                    }}
                                    value={config.noProxy}
                                    onChangeText={(noProxy) => setConfig({ ...config, noProxy })}
                                    placeholder={t('proxyConfig.noProxyPlaceholder')}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </ItemGroup>
                    </>
                )}
            </ScrollView>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: theme.colors.divider,
                backgroundColor: theme.colors.surface,
            }}>
                <Pressable
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 8,
                        minWidth: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: theme.colors.divider,
                    }}
                    onPress={onCancel}
                    disabled={isSaving}
                >
                    <Text style={{ color: theme.colors.text, fontSize: 16, ...Typography.default() }}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 8,
                        minWidth: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.colors.button.primary.background,
                        opacity: isSaving ? 0.5 : 1,
                    }}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={{ color: theme.colors.button.primary.tint, fontSize: 16, fontWeight: '600', ...Typography.default('semiBold') }}>
                        {isSaving ? t('common.saving') : t('common.save')}
                    </Text>
                </Pressable>
            </View>
        </View>
        </RNModal>
    );
}
