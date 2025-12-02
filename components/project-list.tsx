import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from '@/components/ui/icon';
import { Colors as ThemeColors, Spacing, Typography } from '@/constants/theme';

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
  const colors = ThemeColors.light;
  const isSelected = currentProjectId === item.id;

  return (
    <Pressable onPress={() => onSelect(item.id)}>
      <View style={[styles.row, index !== 0 && styles.rowSeparator, isSelected && { backgroundColor: colors.primary + '20', borderRadius: 8 }]}>
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
    borderTopColor: ThemeColors.light.border,
  },
  title: {
    fontSize: Typography.fontSize.base,
  },
});
