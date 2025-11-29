import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert utility
 * Uses native Alert.alert on iOS/Android and window.confirm/alert on web
 *
 * @example
 * // Simple alert
 * showAlert.alert('Success', 'Your profile has been updated');
 *
 * @example
 * // Confirmation dialog
 * showAlert.confirm(
 *   'Delete Account',
 *   'This action cannot be undone',
 *   () => deleteAccount(),
 *   () => console.log('Cancelled')
 * );
 *
 * @example
 * // Destructive confirmation (for dangerous actions)
 * showAlert.confirmDestructive(
 *   'Sign Out',
 *   'Are you sure you want to sign out?',
 *   async () => await logout(),
 *   undefined,
 *   'Sign Out',
 *   'Cancel'
 * );
 */
export const showAlert = {
  /**
   * Show a simple alert with an OK button
   */
  alert: (title: string, message?: string, onPress?: () => void) => {
    if (Platform.OS === 'web') {
      const fullMessage = message ? `${title}\n\n${message}` : title;
      window.alert(fullMessage);
      onPress?.();
    } else {
      Alert.alert(title, message, [
        {
          text: 'OK',
          onPress,
        },
      ]);
    }
  },

  /**
   * Show a confirmation dialog with Cancel and OK buttons
   */
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'OK',
    cancelText: string = 'Cancel'
  ) => {
    if (Platform.OS === 'web') {
      const fullMessage = `${title}\n\n${message}`;
      const confirmed = window.confirm(fullMessage);
      if (confirmed) {
        onConfirm();
      } else {
        onCancel?.();
      }
    } else {
      Alert.alert(title, message, [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: 'destructive',
          onPress: onConfirm,
        },
      ]);
    }
  },

  /**
   * Show a destructive confirmation (for dangerous actions like logout, delete)
   */
  confirmDestructive: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    if (Platform.OS === 'web') {
      const fullMessage = `${title}\n\n${message}`;
      const confirmed = window.confirm(fullMessage);
      if (confirmed) {
        // Handle both sync and async callbacks
        Promise.resolve(onConfirm()).catch(error => {
          console.error('[Alert] Error in confirm callback:', error);
        });
      } else {
        onCancel?.();
      }
    } else {
      Alert.alert(title, message, [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: 'destructive',
          onPress: () => {
            // Handle both sync and async callbacks
            Promise.resolve(onConfirm()).catch(error => {
              console.error('[Alert] Error in confirm callback:', error);
            });
          },
        },
      ]);
    }
  },
};

