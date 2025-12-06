import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from '@/components/ui/icon';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ProjectItem = {
  id: string;
  name: string;
  description?: string | null;
};

type ProjectCellProps = {
  item: ProjectItem;
  index: number;
  currentProjectId?: string | null;
  onSelect: (id: string) => void;
};

const ProjectCell = ({ item, index, currentProjectId, onSelect }: ProjectCellProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isSelected = currentProjectId === item.id;

  return (
    <Pressable onPress={() => onSelect(item.id)}>
      <View style={[styles.row, index !== 0 && { borderTopColor: colors.border }, isSelected && { backgroundColor: colors.primary + '20', borderRadius: 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
        {isSelected && <CheckIcon size="md" color={colors.primary} />}
      </View>
    </Pressable>
  );
};

export const ProjectList = ({
  projects,
  currentProjectId,
  onSelect,
}: {
  projects: ProjectItem[];
  currentProjectId?: string | null;
  onSelect: (id: string) => void;
}) => {
  return (
    <View style={styles.container}>
      {projects.map((item, idx) => (
        <ProjectCell
          key={item.id}
          item={item}
          index={idx}
          currentProjectId={currentProjectId}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  row: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowSeparator: {
    borderTopWidth: 1,
  },
  title: {
    fontSize: Typography.fontSize.base,
  },
});
