import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function AboutScreen({ navigation }) {
  const { t } = useTranslation();

  const programmerTeam = [
    { id: 1, name: 'Mohamed Fayad (Backend)' },
    { id: 2, name: 'Ahmed AbdelAziz (Mobile)' },
    { id: 3, name: 'Hamed Abdulrashid (UI)' },
  ];

  const nursingTeam = [
    { id: 1, name: 'Basmla Shehata' },
    { id: 2, name: 'Basma Hassan' },
    { id: 3, name: 'Basma Ramadan' },
    { id: 4, name: 'Basma Qassem' },
    { id: 5, name: 'Basma Mamdouh' },
    { id: 6, name: 'Basant Bashir' },
    { id: 7, name: 'Basant Khaled' },
    { id: 8, name: 'Boshra Hussein' },
    { id: 9, name: 'Taghreed Ahmed' },
    { id: 10, name: 'Tahany Maher' },
    { id: 11, name: 'Hamed Abdulrashid' },
    { id: 12, name: 'Habiba Ehab' },
    { id: 13, name: 'Habiba Hassan' },
    { id: 14, name: 'Habiba Atiya' },
    { id: 15, name: 'Habiba Mohamed ElSayed' },
    { id: 16, name: 'Habiba Mohamed Atiya' },
    { id: 17, name: 'Mark Sameh' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>عن التطبيق</Text>
        <View style={styles.infoIconContainer}>
          <Ionicons name="information-circle" size={24} color="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Info Card */}
        <View style={styles.appInfoCard}>
           <View style={styles.logoContainer}>
              <Ionicons name="heart-half" size={50} color="#1E6C65" />
           </View>
           <View style={styles.appDetails}>
              <Text style={styles.appNameText}>مساعد العناية بالمرضى</Text>
              <Text style={styles.versionText}>الإصدار 1.0.0</Text>
           </View>
        </View>

        {/* Mission Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={20} color="#1E6C65" style={{ marginLeft: 8 }} />
            <Text style={styles.sectionTitle}>رسالتنا</Text>
          </View>
          <Text style={styles.missionText}>
            تم تطوير هذا التطبيق بروح إنسانية ليكون عوناً لطاقم التمريض في تقديم رعاية أفضل للمرضى. نؤمن أن التفاصيل الصغيرة مثل تذكير الممرض في الوقت المناسب يمكن أن تصنع فرقاً كبيراً في صحة المريض وسلامته.
          </Text>
        </View>

        {/* Programmers Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.teamIconBox}>
              <Ionicons name="code-slash" size={20} color="#1E6C65" />
            </View>
            <Text style={styles.sectionTitle}>فريق المبرمجين</Text>
          </View>
          <Text style={styles.teamDescription}>الطلاب الذين قاموا بتصميم وتطوير التطبيق وبرمجة مميزاته.</Text>
          <View style={styles.memberGrid}>
            {programmerTeam.map(member => (
              <View key={member.id} style={[styles.memberItem, { width: '100%' }]}>
                <Ionicons name="person" size={16} color="#1E6C65" style={{ marginLeft: 8 }} />
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nursing Team Card (Full Width with Two Columns) */}
        <View style={[styles.sectionCard, { backgroundColor: '#F0F7FF', borderColor: '#007AFF' }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.teamIconBox, { backgroundColor: '#E0F0FF' }]}>
              <Ionicons name="people" size={20} color="#007AFF" />
            </View>
            <Text style={[styles.sectionTitle, { color: '#007AFF' }]}>فريق التمريض</Text>
            <View style={styles.countBadge}>
               <Text style={styles.countText}>{nursingTeam.length}</Text>
            </View>
          </View>
          <Text style={styles.teamDescription}>الطلاب الذين ساهموا بالجانب الطبي وفهم احتياجات التمريض داخل المستشفيات.</Text>
          <View style={styles.memberGrid}>
            {nursingTeam.map((member, index) => {
              const IsLastOdd = index === nursingTeam.length - 1 && nursingTeam.length % 2 !== 0;
              return (
                <View key={member.id} style={[styles.memberItemBlue, IsLastOdd && { width: '100%' }]}>
                  <Ionicons name="person" size={16} color="#007AFF" style={{ marginLeft: 8 }} />
                  <Text style={styles.memberName}>{member.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Thanks Card */}
        <View style={[styles.sectionCard, { backgroundColor: '#FFF9E5', borderColor: '#F2C94C' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={20} color="#F2C94C" style={{ marginLeft: 8 }} />
            <Text style={[styles.sectionTitle, { color: '#856404' }]}>شكر وتقدير</Text>
          </View>
          <Text style={[styles.missionText, { color: '#856404', textAlign: 'center' }]}>
            نتوجه بخالص الشكر إلى أساتذتنا الكرام وكل من ساندنا وقدم لنا الدعم والمعرفة لإتمام هذا المشروع.
          </Text>
        </View>

        {/* Vision Card */}
        <View style={[styles.sectionCard, { backgroundColor: '#F0F0FF', borderColor: '#7B61FF' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="rocket" size={20} color="#7B61FF" style={{ marginLeft: 8 }} />
            <Text style={[styles.sectionTitle, { color: '#4834D4' }]}>رؤيتنا المستقبلية</Text>
          </View>
          <Text style={[styles.missionText, { color: '#4834D4' }]}>
            نسعى لتطوير التطبيق ليصبح جزءاً من أنظمة المستشفيات الحديثة لتحسين جودة الرعاية الصحية وتقليل المخاطر الطبية.
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
           <Text style={styles.closeButtonText}>إغلاق</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    backgroundColor: '#1E6C65', padding: 20, paddingTop: 50, paddingBottom: 25,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 10
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backButton: { padding: 5 },
  infoIconContainer: { padding: 5 },
  scrollContent: { padding: 15, paddingBottom: 40 },
  appInfoCard: {
    flexDirection: 'row-reverse', backgroundColor: '#fff', borderRadius: 20, padding: 20,
    alignItems: 'center', marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  logoContainer: {
    width: 80, height: 80, borderRadius: 20, backgroundColor: '#E0F2F1',
    justifyContent: 'center', alignItems: 'center', marginLeft: 15
  },
  appDetails: { flex: 1, alignItems: 'flex-end' },
  appNameText: { fontSize: 22, fontWeight: 'bold', color: '#1E6C65' },
  versionText: { fontSize: 14, color: '#888', marginTop: 5 },
  sectionCard: {
    backgroundColor: '#EBF7F6', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#B2DFDB'
  },
  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E6C65' },
  countBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8
  },
  countText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  missionText: { fontSize: 14, color: '#333', textAlign: 'right', lineHeight: 22 },
  teamsRow: { flexDirection: 'row-reverse', marginBottom: 20 },
  teamColumn: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 15, elevation: 2 },
  teamHeader: { alignItems: 'center', marginBottom: 10 },
  teamIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F9F8',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8
  },
  teamTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E6C65' },
  teamDescription: { fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 10, lineHeight: 16 },
  memberGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10
  },
  memberItem: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F0F9F8',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#B2DFDB'
  },
  memberItemBlue: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F0F7FF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#B0D8FF'
  },
  memberName: { fontSize: 11, color: '#333', fontWeight: 'bold', flex: 1, textAlign: 'right' },
  closeButton: {
    backgroundColor: '#1E6C65', borderRadius: 15, padding: 18,
    alignItems: 'center', marginTop: 10, marginBottom: 20, elevation: 5
  },
  closeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
