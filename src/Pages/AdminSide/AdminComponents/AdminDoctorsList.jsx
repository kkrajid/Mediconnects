import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Camera, Search, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { all_doctors_Profile, add_new_doctor_ } from '../../../api/user';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getToastConfig = () => ({
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#333',
    color: '#fff',
  },
});

function AdminDoctorsList() {
  const [searchInput, setSearchInput] = useState('');
  const [listOfSpecialization, setListOfSpecialization] = useState([]);
  const [blockUser, setBlockUser] = useState(false);
  const [formData, setFormData] = useState({
    user: {
      full_name: '',
      email: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      password: '',
      role: 'Doctor',
    },
    specialization: '',
    license_number: '',
    service_charge: '0',
    address: {
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
    },
    profile_pic: null,
  });

  const { data: doctorProfiles, error, isLoading, refetch } = useQuery(['all_doctors_Profile'], all_doctors_Profile);

  const add_new_doctor_addMutation = useMutation({
    mutationFn: (formData) => add_new_doctor_(formData),
    onSuccess: () => {
      toast.success('Doctor added successfully!', getToastConfig());
      refetch();
    },
    onError: (error) => {
      console.error(error.message);
      toast.error('Failed to add the doctor. Please try again.', getToastConfig());
    },
  });

  useEffect(() => {
    if (doctorProfiles) {
      const specializations = [...new Set(doctorProfiles.map((item) => item?.specialization))];
      setListOfSpecialization(specializations);
    }
  }, [doctorProfiles]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevUserData) => ({
          ...prevUserData,
          profile_pic: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    add_new_doctor_addMutation.mutate(formData);
  };

  const filteredDoctors = doctorProfiles?.filter(
    (doctor) =>
      doctor.user.full_name?.toLowerCase().includes(searchInput.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchInput.toLowerCase())
  ) || [];

  if (isLoading || add_new_doctor_addMutation.isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>Error loading doctors: {error.message}</AlertDescription></Alert>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Doctors</CardTitle>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={formData.user.full_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user: { ...prev.user, full_name: e.target.value } }))}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.user.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user: { ...prev.user, email: e.target.value } }))}
                  />
                  <Input
                    type="date"
                    placeholder="Date of Birth"
                    value={formData.user.date_of_birth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user: { ...prev.user, date_of_birth: e.target.value } }))}
                  />
                  <Select
                    value={formData.user.gender}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, user: { ...prev.user, gender: value } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Phone"
                    value={formData.user.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user: { ...prev.user, phone: e.target.value } }))}
                  />
                  <Input
                    placeholder="Specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
                  />
                  <Input
                    placeholder="License Number"
                    value={formData.license_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, license_number: e.target.value }))}
                  />
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <Button type="submit">Add Doctor</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" onClick={() => setBlockUser(!blockUser)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Doctor"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Button variant="outline" onClick={() => setSearchInput("")}>All</Button>
            {listOfSpecialization.slice(0, 4).map((item, index) => (
              <Button key={index} variant="outline" onClick={() => setSearchInput(item)}>{item}</Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDoctors.map((profile, index) => (
              <Card key={index}>
                <CardContent className="flex flex-col items-center p-4">
                  <img
                    src={profile.profile_pic || "/api/placeholder/100/100"}
                    alt={profile.user.full_name}
                    className="w-24 h-24 rounded-full mb-2"
                  />
                  <h3 className="font-semibold text-lg">{profile.user.full_name}</h3>
                  <p className="text-sm text-gray-500">{profile.specialization}</p>
                  {blockUser && (
                    <Button variant="destructive" size="sm" className="mt-2">
                      Block
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDoctorsList;