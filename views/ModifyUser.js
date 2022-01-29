import React, {useContext} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {Input, Button, Text} from 'react-native-elements';
import {useForm, Controller} from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from '../hooks/ApiHooks';
import PropTypes from 'prop-types';
import {MainContext} from '../contexts/MainContext';

const ModifyUser = ({navigation}) => {
  const {user, setUser} = useContext(MainContext);
  const {putUser, checkUserName} = useUser();

  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm({
    defaultValues: {
      username: user.username,
      password: '',
      confirmPassword: '',
      email: user.email,
      full_name: user.full_name,
    },
    mode: 'onBlur',
    // when user leaves the field, field is blurred. On change is on typing
  });
  const onSubmit = async (data) => {
    console.log(data);
    try {
      delete data.confirmPassword;
      if (data.password === '') {
        delete data.password;
      }
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await putUser(data, userToken);
      console.log('update user onSubmit', userData);
      if (userData) {
        Alert.alert('Success', userData.message);
        delete data.password;
        setUser(data);
        navigation.navigate('Profile');
      } else {
        console.log(userData.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'This is required'},
          minLength: {
            value: 3,
            message: 'Username has to be at least 3 charaters',
          },
          validate: async (value) => {
            try {
              const available = await checkUserName(value);
              if (available || user.username === value) {
                return true;
              } else {
                return 'Username is already taken';
              }
            } catch (error) {
              throw new Error(error.message);
            }
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={{borderWidth: 1, width: 200}}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            placeholder="Username"
            errorMessage={errors.username && errors.username.message}
          />
        )}
        name="username"
      />
      {errors.username && <Text>{errors.username.message}</Text>}

      <Controller
        control={control}
        rules={{
          minLength: {
            value: true,
            message: 'Password has to be at least 5 characters',
          },
          // pattern: {
          //   value: /(?=.*[\p{Lu}])(?=.*[0-9]).{8,}/u,
          //   message: 'Min 8, Uppercase, number',
          // },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={{borderWidth: 1}}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            secureTextEntry={true}
            placeholder="Password"
            errorMessage={errors.password && errors.password.message}
          />
        )}
        name="password"
      />

      <Controller
        control={control}
        rules={{
          validate: async (value) => {
            const {password} = getValues();
            if (value === password) {
              return true;
            } else {
              return 'Passwords do not match';
            }
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={{borderWidth: 1}}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            secureTextEntry={true}
            placeholder="Confirm password"
            errorMessage={
              errors.confirmPassword && errors.confirmPassword.message
            }
          />
        )}
        name="confirmPassword"
      />

      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'This is required'},
          pattern: {
            value: /\S+@\S+\.\S+$/i,
            /* value: /^[a-z0-9_-]+(\.[a-z0-9_-]+)@[a-z0-9-]+(\.[a-z0-9_-]+)\.[a-z]{2,}$/i,*/
            message: 'Has to be valid email',
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={{borderWidth: 1, width: 200}}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            placeholder="Email"
            errorMessage={errors.email && errors.email.message}
          />
        )}
        name="email"
      />

      <Controller
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            style={{borderWidth: 1, width: 200}}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="words"
            placeholder="Full name"
          />
        )}
        name="full_name"
      />

      <Button
        title="Submit"
        onPress={handleSubmit(onSubmit)}
        style={{width: '50%', alignSelf: 'center'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 10,
    alignSelf: 'stretch',
  },
});

ModifyUser.propTypes = {
  navigation: PropTypes.object,
};

export default ModifyUser;
